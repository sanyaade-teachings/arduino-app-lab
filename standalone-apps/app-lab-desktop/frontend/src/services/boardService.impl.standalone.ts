import { BoardService } from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  Carrier,
  CarriersStatus,
} from '@cloud-editor-mono/ui-components/lib/components-by-app/app-lab';

import {
  CarrierDisable,
  CarrierEnable,
  CarrierList,
  CarrierShow,
  DisableNetworkMode,
  EnableNetworkMode,
  GetBoardList,
  GetBoardName,
  GetKernelVersion,
  GetKeyboardLayout,
  GetLinuxDistribution,
  GetNetworkModeStatus,
  GetOSImageVersion,
  IsBoard,
  IsUserPasswordSet,
  ListKeyboardLayouts,
  NeedsImageUpdate,
  OpenBoardTerminal,
  RebootBoard,
  SelectBoard,
  SetBoardName,
  SetKeyboardLayout,
  SetUserPassword,
} from '../../wailsjs/go/app/App';
import {
  mapCarrier,
  mapCarriersStatus,
  mapGetBoards,
} from './boardService.mapper';
import { filterBoards } from './boardService.utils';

export const isBoard: BoardService['isBoard'] = async function () {
  return IsBoard();
};

export const getBoards: BoardService['getBoards'] = async function () {
  try {
    const result = await GetBoardList();

    const mapped = mapGetBoards(result);

    const filtered = await filterBoards(mapped);

    const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
  } catch (e) {
    console.error('Error fetching boards:', e);
    return [];
  }
};

export const selectBoard: BoardService['selectBoard'] = async function (
  boardId: string,
  password?: string,
) {
  return SelectBoard(boardId, password || '');
};

export const getBoardName: BoardService['getBoardName'] = async function () {
  try {
    const boardName = await GetBoardName();
    return boardName;
  } catch (e) {
    console.error('Error getting board name:', e);
  }
  return '';
};

export const setBoardName: BoardService['setBoardName'] = async function (
  boardName: string,
) {
  try {
    return SetBoardName(boardName);
  } catch {
    console.error('Error setting board name:', boardName);
  }
  return;
};

export const getKeyboardLayout: BoardService['getKeyboardLayout'] =
  async function () {
    try {
      const layout = await GetKeyboardLayout();
      return layout;
    } catch (e) {
      console.error('Error getting keyboard layout:', e);
    }
    return '';
  };

export const listKeyboardLayouts: BoardService['listKeyboardLayouts'] =
  async function () {
    try {
      const layouts = await ListKeyboardLayouts();
      return layouts;
    } catch (e) {
      console.error('Error listing keyboard layouts:', e);
    }
    return [];
  };

export const setKeyboardLayout: BoardService['setKeyboardLayout'] =
  async function (layoutId: string) {
    try {
      return SetKeyboardLayout(layoutId);
    } catch {
      console.error('Error setting keyboard layout:', layoutId);
    }
    return;
  };

export const isUserPasswordSet: BoardService['isUserPasswordSet'] =
  async function () {
    try {
      return IsUserPasswordSet();
    } catch {
      console.error('Error getting user password set status');
    }
    return false;
  };

export const setUserPassword: BoardService['setUserPassword'] = async function (
  password: string,
) {
  try {
    return SetUserPassword(password);
  } catch {
    console.error('Error setting user password:', password);
  }
  return;
};

export const getOSImageVersion: BoardService['getOSImageVersion'] =
  async function () {
    return GetOSImageVersion();
  };

export const boardNeedsImageUpdate: BoardService['boardNeedsImageUpdate'] =
  async function () {
    return NeedsImageUpdate();
  };

export const openBoardTerminal: BoardService['openBoardTerminal'] =
  async function () {
    try {
      return await OpenBoardTerminal();
    } catch (e) {
      throw new Error(`${e}`);
    }
  };

export const isNetworkModeEnabled: BoardService['isNetworkModeEnabled'] =
  async function () {
    try {
      return GetNetworkModeStatus();
    } catch {
      console.error('Error getting network mode status');
    }
    return false;
  };

export const setNetworkMode: BoardService['setNetworkMode'] = async function (
  enabled: boolean,
  password: string,
) {
  await (enabled ? EnableNetworkMode(password) : DisableNetworkMode(password));
  return enabled;
};

export const getKernelVersion: BoardService['getKernelVersion'] =
  async function () {
    try {
      return await GetKernelVersion();
    } catch (e) {
      console.error('Error getting kernel version:', e);
    }
    return '';
  };

export const getLinuxDistribution: BoardService['getLinuxDistribution'] =
  async function () {
    try {
      return await GetLinuxDistribution();
    } catch (e) {
      console.error('Error getting Linux distribution:', e);
    }
    return '';
  };

export const getCarriers: BoardService['getCarriers'] = async function () {
  try {
    const result = await CarrierList();
    return result.map(mapCarrier);
  } catch (e) {
    throw new Error(`${e}`);
  }
};

export const getCarriersStatus: BoardService['getCarriersStatus'] =
  async function () {
    try {
      const result = await CarrierShow('');
      return mapCarriersStatus(result);
    } catch (e) {
      throw new Error(`${e}`);
    }
  };

export const enableCarriers: BoardService['enableCarriers'] = async function (
  status: CarriersStatus,
  password: string,
) {
  try {
    await Promise.all(
      status.carriers.map((carrier) =>
        CarrierEnable(
          password,
          carrier.carrierName,
          carrier.next.map((it) => ({
            Device: it.device,
            Option: it.option,
          })),
        ),
      ),
    );
  } catch (e) {
    throw new Error(`${e}`);
  }
};

export const disableCarriers: BoardService['disableCarriers'] = async function (
  carriers: Carrier[],
  password: string,
) {
  try {
    await Promise.all(
      carriers.map((carrier) => CarrierDisable(password, carrier.name)),
    );
  } catch (e) {
    throw new Error(`${e}`);
  }
};

export const rebootBoard: BoardService['rebootBoard'] = async function (
  password: string,
) {
  try {
    await RebootBoard(password);
  } catch (e) {
    throw new Error(`${e}`);
  }
};
