"use client";

import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useDeleteEstablishment } from "@/hooks/useEstablishments";
import { describeError } from "@/lib/api/errorMessages";

type DeleteEstablishmentDialogProps = {
  open: boolean;
  establishmentId: number;
  onClose: () => void;
};

export function DeleteEstablishmentDialog({ open, establishmentId, onClose }: DeleteEstablishmentDialogProps) {
  const router = useRouter();
  const deleteEstablishment = useDeleteEstablishment();

  const handleClose = () => {
    if (deleteEstablishment.isPending) return;
    deleteEstablishment.reset();
    onClose();
  };

  const handleConfirm = async () => {
    // Awaited instead of a per-call onSuccess: clearing the session unmounts
    // this dialog, and per-call callbacks don't fire on unmounted components.
    try {
      await deleteEstablishment.mutateAsync(establishmentId);
    } catch {
      return; // shown through deleteEstablishment.error
    }
    router.replace("/");
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="delete-establishment-title">
      <DialogTitle id="delete-establishment-title">Excluir conta?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seu estabelecimento deixará de aparecer na plataforma e você não poderá mais entrar com
          esta conta. Esta ação não pode ser desfeita por aqui.
        </DialogContentText>
        {deleteEstablishment.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {describeError(deleteEstablishment.error)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={deleteEstablishment.isPending}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleConfirm}
          loading={deleteEstablishment.isPending}
        >
          Excluir conta
        </Button>
      </DialogActions>
    </Dialog>
  );
}
