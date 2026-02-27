import {
  boardNeedsImageUpdate,
  getBoards,
  reloadApp,
  selectBoard as apiSelectBoard,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import { Board } from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';
import { useQuery } from '@tanstack/react-query';
import { del, get, set } from 'idb-keyval';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { create } from 'zustand';

import { useIsBoard } from '../../hooks/useIsBoard';

const CONNECT_TIMEOUT_MS = 15_000;
const AUTO_SELECT_BOARD_ID = 'arduino:auto-select-board-id';

type BoardLifecycleState = {
  boardIsReachable: boolean;
  setBoardIsReachable: (isReachable: boolean) => void;
  selectedConnectedBoard?: Board;
  setSelectedConnectedBoard: (board: Board | undefined) => void;
  needsImageUpdate?: boolean;
  setNeedsImageUpdate: (value: boolean) => void;
  boardIsFlashing?: boolean;
  setBoardIsFlashing: (value: boolean) => void;
};

export const useBoardLifecycleStore = create<BoardLifecycleState>((set) => ({
  boardIsReachable: false,
  setBoardIsReachable: (isReachable: boolean): void =>
    set({ boardIsReachable: isReachable }),
  selectedConnectedBoard: undefined,
  setSelectedConnectedBoard: (board: Board | undefined): void =>
    set({ selectedConnectedBoard: board }),
  needsImageUpdate: undefined,
  setNeedsImageUpdate: (needsImageUpdate: boolean): void =>
    set({ needsImageUpdate }),
  boardIsFlashing: undefined,
  setBoardIsFlashing: (boardIsFlashing: boolean): void =>
    set({ boardIsFlashing }),
}));

export type UseBoards = () => {
  boards: Board[];
  selectedBoard?: Board;
  selectBoard: (board: Board) => Promise<void>;
  autoSelectBoard: (boardId: string) => Promise<void>;
  isAutoSelectingBoard: boolean;
  showBoardConnPswPrompt: boolean;
  onConnPswCancel: () => void;
  onConnPswSubmit: (password: string) => Promise<void>;
  isConnectingToBoard: boolean;
  connToBoardError?: string;
  connToBoardCompleted: boolean;
  setSelectedBoardCheckingStatus: () => void;
};

type BoardsState = {
  boards: Board[];
  selected: {
    board?: Board;
    status?:
      | 'selection-started'
      | 'conn-started'
      | 'conn-error'
      | 'conn-and-selection-done';
    error?: string;
  };
};

type BoardsAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | {
      type: 'START_BOARD_SELECTION';
      payload: { board: Board };
    }
  | { type: 'START_BOARD_CONN' }
  | { type: 'BOARD_CONN_ERROR'; payload?: string }
  | { type: 'COMPLETE_BOARD_CONN_AND_SELECTION' }
  | { type: 'UNSELECT_BOARD' }
  | { type: 'SET_SELECTED_BOARD_CHECKING_STATUS' };

const boardsInitialState: BoardsState = {
  boards: [],
  selected: {
    board: undefined,
    status: undefined,
    error: undefined,
  },
};

function boardsReducer(state: BoardsState, action: BoardsAction): BoardsState {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload };

    case 'START_BOARD_SELECTION':
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          isSelecting: b.id === action.payload.board.id,
        })),
        selected: {
          board: action.payload.board,
          status: 'selection-started',
          error: undefined,
        },
      };

    case 'START_BOARD_CONN':
      return {
        ...state,
        selected: {
          ...state.selected,
          status: 'conn-started',
          error: undefined,
        },
      };

    case 'BOARD_CONN_ERROR':
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          isSelecting: false,
        })),
        selected: {
          ...state.selected,
          status: 'conn-error',
          error: action.payload,
        },
      };

    case 'COMPLETE_BOARD_CONN_AND_SELECTION':
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          isSelecting: false,
        })),
        selected: {
          ...state.selected,
          status: 'conn-and-selection-done',
          error: undefined,
        },
      };

    case 'UNSELECT_BOARD':
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          isSelecting: false,
        })),
        selected: { ...boardsInitialState.selected },
      };

    case 'SET_SELECTED_BOARD_CHECKING_STATUS':
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          checkingStatus: b.id === state.selected.board?.id,
        })),
      };

    default:
      return state;
  }
}

const withTimeout = async <T>(p: Promise<T>, timeoutMs: number): Promise<T> => {
  let t: number | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    t = window.setTimeout(
      () => reject(new Error('CONNECTION_TIMEOUT')),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([p, timeoutPromise]);
  } finally {
    if (typeof t !== 'undefined') window.clearTimeout(t);
  }
};

const isAuthFailed = (err: unknown): boolean =>
  Boolean((err as { isSSHErrorAuthFailed?: boolean })?.isSSHErrorAuthFailed);

export const useBoards: UseBoards = () => {
  const {
    boardIsFlashing,
    setBoardIsReachable,
    setSelectedConnectedBoard,
    selectedConnectedBoard,
    needsImageUpdate,
    setNeedsImageUpdate,
  } = useBoardLifecycleStore();

  const { data: isBoard } = useIsBoard();
  const [
    {
      boards,
      selected: {
        board: selectedBoard,
        status: boardStatus,
        error: boardError,
      },
    },
    dispatch,
  ] = useReducer(boardsReducer, boardsInitialState);

  const [isAutoSelectingBoard, setIsAutoSelectingBoard] = useState(true);

  const { data: retrievedBoards } = useQuery(['boards'], getBoards, {
    refetchInterval: isBoard ? undefined : 3000,
    enabled: !isBoard,
  });

  // If the selected board is unplugged, and no longer detected for 5 seconds, reload the app
  useEffect(() => {
    let timeout: NodeJS.Timeout | void;
    if (
      !boardIsFlashing &&
      selectedBoard &&
      selectedBoard.connectionType === 'USB' && //! manage disconnect only for USB boards, as we don't have serial in network mode tes
      retrievedBoards &&
      !retrievedBoards.map((b) => b.serial).includes(selectedBoard.serial)
    ) {
      timeout = setTimeout(() => {
        reloadApp();
      }, 5000);
    }

    return () => timeout && clearTimeout(timeout);
  }, [boardIsFlashing, retrievedBoards, selectedBoard]);

  useEffect(() => {
    if (retrievedBoards) {
      dispatch({ type: 'SET_BOARDS', payload: retrievedBoards });
    }
  }, [retrievedBoards]);

  useEffect(() => {
    if (isBoard) {
      setBoardIsReachable(true);
    }
  }, [isBoard, setBoardIsReachable]);

  useEffect(() => {
    const setNeedsImageUpdateAsync = async (): Promise<void> => {
      const needsUpdate = await boardNeedsImageUpdate();
      setNeedsImageUpdate(needsUpdate);
    };
    if (selectedConnectedBoard && needsImageUpdate === undefined) {
      setNeedsImageUpdateAsync();
    }
  }, [selectedConnectedBoard, setNeedsImageUpdate, needsImageUpdate]);

  const connectToBoard = useCallback(
    async (board: Board, password?: string): Promise<void> => {
      dispatch({ type: 'START_BOARD_CONN' });

      try {
        await withTimeout(
          apiSelectBoard(board.id, password),
          CONNECT_TIMEOUT_MS,
        );

        dispatch({ type: 'COMPLETE_BOARD_CONN_AND_SELECTION' });
        setBoardIsReachable(true);
        setSelectedConnectedBoard(board);
      } catch (err) {
        const msg = isAuthFailed(err)
          ? 'Password is not correct. Please try again.'
          : err instanceof Error && err.message === 'CONNECTION_TIMEOUT'
          ? 'Connection timeout. Check network connection and try again.'
          : 'An error occurred while connecting to the board.';
        dispatch({ type: 'BOARD_CONN_ERROR', payload: msg });

        console.error('Failed to select board', err);
        throw err;
      }
    },
    [setBoardIsReachable, setSelectedConnectedBoard],
  );

  const handleSelectBoard = useCallback(
    async (board: Board) => {
      await del(AUTO_SELECT_BOARD_ID);

      dispatch({
        type: 'START_BOARD_SELECTION',
        payload: { board },
      });

      if (board.connectionType !== 'Network') {
        try {
          await connectToBoard(board);
        } catch {
          dispatch({ type: 'UNSELECT_BOARD' });
        }
      }
    },
    [connectToBoard],
  );

  const handleBoardConnectionWithPassword = useCallback(
    async (password: string) => {
      if (!selectedBoard) {
        console.error('No board selected for password submission');
        return;
      }

      try {
        await connectToBoard(selectedBoard, password);
      } catch (error) {
        let errorMessage;
        if (
          (error as { isSSHErrorAuthFailed?: boolean }).isSSHErrorAuthFailed
        ) {
          errorMessage = 'Password is not correct. Please try again.';
        } else {
          console.error('Error selecting board:', error);
          errorMessage = 'An error occurred while connecting to the board.';
        }
        dispatch({ type: 'BOARD_CONN_ERROR', payload: errorMessage });
      }
    },
    [connectToBoard, selectedBoard],
  );

  const onConnPswCancel = useCallback(() => {
    dispatch({ type: 'UNSELECT_BOARD' });
  }, []);

  const setSelectedBoardCheckingStatus = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_BOARD_CHECKING_STATUS' });
  }, []);

  // save boardId on idb to auto-select it on app reload
  const autoSelectBoard = useCallback(async (boardId: string) => {
    await set(AUTO_SELECT_BOARD_ID, boardId);
    reloadApp();
  }, []);

  // retrieve boardId from idb to auto-select board on app reload after it has been switched
  useEffect(() => {
    const autoSelectBoard = async (): Promise<void> => {
      if (isBoard) {
        setIsAutoSelectingBoard(false);
        return;
      }

      const boardId = await get<string>(AUTO_SELECT_BOARD_ID);

      if (!boardId) {
        if (!boardStatus || boardStatus === 'conn-error') {
          setIsAutoSelectingBoard(false);
        }
        return;
      }

      if (!boards.length) return;

      const board = boards.find((board) => board.id === boardId);

      if (!board) {
        setIsAutoSelectingBoard(false);
        return;
      }

      await handleSelectBoard(board);
    };

    autoSelectBoard();
  }, [boardStatus, boards, handleSelectBoard, isBoard]);

  return {
    boards,
    selectedBoard: selectedConnectedBoard,
    selectBoard: handleSelectBoard,
    autoSelectBoard,
    isAutoSelectingBoard,
    showBoardConnPswPrompt: selectedBoard?.connectionType === 'Network',
    onConnPswCancel,
    onConnPswSubmit: handleBoardConnectionWithPassword,
    isConnectingToBoard: boardStatus === 'conn-started',
    connToBoardError: boardStatus === 'conn-error' ? boardError : undefined,
    connToBoardCompleted: boardStatus === 'conn-and-selection-done',
    setSelectedBoardCheckingStatus,
  };
};
