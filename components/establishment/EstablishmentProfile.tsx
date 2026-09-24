"use client";

import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { QueryStateView } from "@/components/ui/QueryStateView";
import { useEstablishment } from "@/hooks/useEstablishments";
import { useSession } from "@/hooks/useSession";
import { DeleteEstablishmentDialog } from "./DeleteEstablishmentDialog";
import { EditEstablishmentForm } from "./EditEstablishmentForm";
import { EstablishmentProfileCard } from "./EstablishmentProfileCard";

/**
 * The logged-in establishment's own profile. Edit/delete only exist here, for
 * the session's own id — a UX mirror of the backend's ownership rule, which
 * is what actually enforces it (403/404).
 */
export function EstablishmentProfile() {
  const session = useSession();
  const { data: establishment, isPending, error, refetch } = useEstablishment(session?.id);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <QueryStateView isPending={isPending} error={error} onRetry={() => void refetch()}>
      {establishment && (
        <Stack spacing={2}>
          {saved && (
            <Alert severity="success" onClose={() => setSaved(false)}>
              Perfil atualizado.
            </Alert>
          )}
          {editing ? (
            <EditEstablishmentForm
              establishment={establishment}
              onCancel={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                setSaved(true);
              }}
            />
          ) : (
            <EstablishmentProfileCard
              establishment={establishment}
              actions={
                <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "space-between" }}>
                  <Button
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setDeleting(true)}
                  >
                    Excluir conta
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSaved(false);
                      setEditing(true);
                    }}
                  >
                    Editar perfil
                  </Button>
                </Stack>
              }
            />
          )}
          <DeleteEstablishmentDialog
            open={deleting}
            establishmentId={establishment.id}
            onClose={() => setDeleting(false)}
          />
        </Stack>
      )}
    </QueryStateView>
  );
}
