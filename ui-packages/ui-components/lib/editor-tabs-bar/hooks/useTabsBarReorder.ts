import {
  CollisionDetection,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';

import { SelectableFileData } from '../EditorTabsBar.type';

type UseTabsBarReorder = (params: {
  tabs: SelectableFileData[];
  updateTabOrder: (newOrder: string[]) => void;
}) => {
  activeId: string | null;
  activeTab: SelectableFileData | null;
  dropIndicator: { tabId: string; direction: 'left' | 'right' } | null;
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragMove: (event: DragMoveEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
};

// Implements drag and drop collision logic for vertical tab list
// This allows to evaluate pointer collision also outside of the tab list container
export const verticalColumnCollisionStrategy: CollisionDetection = (args) => {
  const { pointerCoordinates, droppableContainers } = args;

  if (!pointerCoordinates || droppableContainers.length === 0) {
    return [];
  }

  // Sort containers bases on left coordinate to properly
  // detect out of bound dragging on left and right side of the list
  const sortedContainers = [...droppableContainers].sort((a, b) => {
    return (a.rect.current?.left ?? 0) - (b.rect.current?.left ?? 0);
  });

  const firstTab = sortedContainers[0];
  const lastTab = sortedContainers[sortedContainers.length - 1];
  const mouseX = pointerCoordinates.x;

  // If out of bound to the left, match the first tab
  if (mouseX <= (firstTab.rect.current?.left ?? 0)) {
    return [{ id: firstTab.id }];
  }
  // If out of bound to the right, match the last tab
  if (mouseX >= (lastTab.rect.current?.right ?? 0)) {
    return [{ id: lastTab.id }];
  }

  // Find target based on pointer coordinates
  const target = sortedContainers.find((container) => {
    const rect = container.rect.current;
    return rect && mouseX >= rect.left && mouseX <= rect.right;
  });
  if (target) {
    return [{ id: target.id }];
  }

  // Fallback to default behavior
  return rectIntersection(args);
};

export const useTabsBarReorder: UseTabsBarReorder = ({
  tabs,
  updateTabOrder,
}) => {
  const [dropIndicator, setDropIndicator] = useState<{
    tabId: string;
    direction: 'left' | 'right';
  } | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.fileId === activeId) ?? null,
    [tabs, activeId],
  );

  // Delay pointer sensor event to not override other pointer interactions by dragging
  // eg. button click, context menu
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 1,
    },
  });
  const sensors = useSensors(
    pointerSensor,
    useSensor(KeyboardSensor),
    useSensor(TouchSensor),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id as string);
    },
    [setActiveId],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const { activatorEvent, delta, over } = event;

      if (over && activatorEvent instanceof MouseEvent) {
        const mouseX = activatorEvent.clientX + delta.x;
        const overRect = over.rect;
        const midpoint = overRect.left + overRect.width / 2;

        let direction: 'left' | 'right' | null = null;
        if (mouseX > midpoint) {
          direction = 'right';
        }
        if (mouseX < midpoint) {
          direction = 'left';
        }
        setDropIndicator((prev) => ({
          tabId: over.id as string,
          direction: direction || prev?.direction || 'left',
        }));
      }
    },
    [setDropIndicator],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, activatorEvent, delta } = event;
      setDropIndicator(null);

      if (over && active.id !== over.id) {
        const oldIndex = tabs.findIndex((tab) => tab.fileId === active.id);
        const overIndex = tabs.findIndex((tab) => tab.fileId === over.id);

        // Calculate current Mouse X
        const mouseX = (activatorEvent as MouseEvent).clientX + delta.x;

        // Get the midpoint of the tab we are dropping on
        const overRect = over.rect;
        const midpoint = overRect.left + overRect.width / 2;

        let newIndex = overIndex;

        // Logic: If mouse is past the midpoint, we want to land AFTER this item.
        // If mouse is before the midpoint, we want to land BEFORE this item.
        if (mouseX > midpoint && oldIndex < overIndex) {
          // Already moving right, staying at overIndex is correct
          newIndex = overIndex;
        } else if (mouseX < midpoint && oldIndex > overIndex) {
          // Already moving left, staying at overIndex is correct
          newIndex = overIndex;
        } else if (mouseX > midpoint && oldIndex > overIndex) {
          // Moving left but dropped on right half, shift one forward
          newIndex = overIndex + 1;
        } else if (mouseX < midpoint && oldIndex < overIndex) {
          // Moving right but dropped on left half, shift one back
          newIndex = overIndex - 1;
        }
        const newTabList = arrayMove(tabs, oldIndex, newIndex);
        updateTabOrder(newTabList.map((tab) => tab.fileId));
      }
    },
    [tabs, updateTabOrder],
  );

  return {
    activeId,
    activeTab,
    dropIndicator,
    sensors,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
