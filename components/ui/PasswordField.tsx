"use client";

import { useState } from "react";
import { IconButton, InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

/** `TextField` for passwords with a show/hide toggle. */
export function PasswordField(props: Omit<TextFieldProps, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        ...props.slotProps,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setVisible((v) => !v)}
                edge="end"
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
