export type WhatsNewAdHocLogic = () => {
  open: boolean;
  onClose: () => void;
  releaseNotes?: { content: string; image: string };
};

export type WhatsNewAdHocProps = { logic: WhatsNewAdHocLogic };
