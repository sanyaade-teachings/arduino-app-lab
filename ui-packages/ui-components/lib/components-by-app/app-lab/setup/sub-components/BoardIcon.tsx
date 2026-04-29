import {
  Board as BoardGenericIcon,
  BoardUnoQ,
  BoardVentunoQ,
} from '@cloud-editor-mono/images/assets/icons';

import { Board } from '../setup.type';

interface BoardIconProps {
  board: Board;
}

const BoardIcon: React.FC<BoardIconProps> = (props: BoardIconProps) => {
  const { board } = props;

  switch (board.fqbn) {
    case 'arduino:zephyr:unoq':
      return <BoardUnoQ />;
    case 'arduino:zephyr:ventunoq':
      return <BoardVentunoQ />;
    default:
      return <BoardGenericIcon />;
  }
};

export default BoardIcon;
