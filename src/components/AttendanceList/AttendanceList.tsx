import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, Redo, Undo } from "@mui/icons-material";
import { Box, Container, Stack, Typography, Button, IconButton } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

type attendance = 'presente' | 'faltou' | 'justificado' | null;

interface IAttendance {
    id: number;
    name: string;
    attendances: attendance
}

const AttendanceList = () => {

    const [number, setNumber] = useState(0);
    const [attendanceList, setAttendanceList] = useState<IAttendance[]>([]);

    const previous = attendanceList[number - 1]
    const current = attendanceList[number]
    const next = attendanceList[number + 1]

    const previousAttendance = previous?.attendances;
    const currentAttendance = current?.attendances;
    const nextAttendance = next?.attendances;

    useEffect(() => {
        axios.get('http://localhost:3000/attendanceList')
            .then(response => {
                setAttendanceList(response.data);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    const handleStart = () => {
        setNumber(0);
    }
    const handleEnd = () => {
        const attendance = attendanceList.find(attendance=> !attendance.attendances)
        if(attendance){
            setNumber(attendance?.id - 1);
        }else{
            setNumber(attendanceList.length - 1);
        }
    }
    const handleBack = () => {
        if (number > 0) {
            setNumber(n => n - 1);
        }
    }
    const handleNext = () => {
        if (number < attendanceList.length && currentAttendance) {
            setNumber(n => n + 1);
        }
    }

    const handleAttendance = (status: attendance) => {
        if (current) {
            axios.patch(`http://localhost:3000/attendanceList/${current.id}`, {
                attendances: status
            })
                .then(response => {
                    console.log('Dados atualizados com sucesso: ', response.data);
                    axios.get('http://localhost:3000/attendanceList')
                        .then(response => {
                            setAttendanceList(response.data);
                            setNumber(n => n + 1);
                        })
                        .catch(error => {
                            console.error('Error fetching data: ', error);
                        });
                })
                .catch(error => {
                    console.error('Erro ao atualizar dados: ', error);
                });
        }
    }

    const setColor = (attendance: attendance) => {
        console.log(attendance)
        if (attendance === "presente") return "success.main"
        if (attendance === "faltou") return "error"
        if (attendance === "justificado") return "warning.main"
        return "primary"
    }


    return (
        <Container sx={{ height: '100vh' }}>
            <Stack height={'100%'} paddingY={2}>
                <Box flexGrow={1}>
                    <Typography variant="h2" color={setColor(previousAttendance)} sx={{ opacity: '0.3' }}>
                        {previous?.name}
                    </Typography>
                    <Box paddingY={16}>
                        <Typography variant="h1" color={setColor(currentAttendance)} alignItems={"center"}>
                            {current?.name}
                        </Typography>
                    </Box>
                    <Typography variant="h2" color={setColor(nextAttendance)} sx={{ opacity: '0.3' }}>
                        {next?.name}
                    </Typography>
                </Box>
                <Stack direction={"row"} spacing={2} justifyContent={"end"}>
                    <IconButton color="primary" onClick={handleStart}>
                        <KeyboardDoubleArrowLeft />
                    </IconButton>
                    <IconButton color="primary" onClick={handleBack}>
                        <Undo />
                    </IconButton>
                    <Button variant="contained" color="info" onClick={() => handleAttendance('justificado')}>
                        Justificado
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleAttendance('faltou')}>
                        Faltou
                    </Button>
                    <Button variant="contained" color="success" onClick={() => handleAttendance('presente')}>
                        Presente
                    </Button>
                    <IconButton color="primary" onClick={handleNext}>
                        <Redo />
                    </IconButton>
                    <IconButton color="primary" onClick={handleEnd}>
                        <KeyboardDoubleArrowRight />
                    </IconButton>
                </Stack>
            </Stack>
        </Container>
    )
}

export default AttendanceList