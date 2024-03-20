import { CancelOutlined } from "@mui/icons-material"
import { IconButton, Stack, Typography } from "@mui/material"
import { useState } from "react"

const Student = ({ name, onDelete }: { name: string; onDelete: () => void }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <Stack
            direction={'row'}
            borderRadius={1}
            padding={1}
            bgcolor={hovered ? 'primary.main' : 'white'}
            alignItems={"center"}
            onMouseOver={() => { setHovered(true) }}
            onMouseOut={() => { setHovered(false) }}
        >
            <Typography variant="body1" color={hovered ? 'white' : 'primary'} flexGrow={1}>{name}</Typography>
            <IconButton color="error" onClick={onDelete}>
                <CancelOutlined />
            </IconButton>
        </Stack>
    )
}

export default Student