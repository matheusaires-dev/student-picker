/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container, Box, Stack, TextField, Button, Typography, CircularProgress, LinearProgress } from "@mui/material";
import { ChangeEvent, ReactNode, SetStateAction, createContext, useEffect, useState } from "react";
import StudentList from "../components/List/StudentList";

export const AppContext = createContext<{
    students: string[];
    setStudents: React.Dispatch<React.SetStateAction<string[]>>;
}>({
    students: [],
    setStudents: function (_value: SetStateAction<string[]>): void {
        throw new Error("Function not implemented.");
    }
});

const AppProvider = ({ children }: { children?: ReactNode }) => {

    const [name, setName] = useState("");
    const [students, setStudents] = useState<string[]>([]);
    const [index, setIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [cont, setCont] = useState(0);

    const handleName = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }

    const handleAdd = () => {
        if (name && !studentExists(name)) {
            setStudents([...students, name])
        }
    }

    const studentExists = (name: string) => {
        return !!(students.find(student => student === name))
    }

    const handlePicker = () => {
        setLoading(true);

        setTimeout(() => {
            setIndex(Math.floor(Math.random() * students.length))
            setLoading(false);
        }, 4000)
    }

    useEffect(() => {
        if (loading) {
            const id = setInterval(() => {
                setCont(cont => cont + 1)
                if (cont > 3) {
                    clearInterval(id);
                }
            }, 1000)

            return () => {
                clearInterval(id);
            };
        }else{
            setCont(0);
        }

    }, [loading])

    useEffect(() => {
        console.log(cont)
    }, [cont])

    return (
        <AppContext.Provider value={{ students, setStudents }}>
            <Container>
                <Box>
                    <Stack>
                        <Stack direction={'row'} spacing={2}>
                            <TextField
                                id="name"
                                label="Name"
                                value={name}
                                type='text'
                                onChange={handleName}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleAdd} disabled={!name || studentExists(name)}>
                                Adicionar
                            </Button>
                        </Stack>
                        <Box paddingY={4}>
                            <Stack spacing={2}>
                                {!!cont && <Typography variant="h2" color="primary">{cont}</Typography>}
                                {index === null ? loading ? <LinearProgress /> : <StudentList /> : <Box padding={4}><Typography variant="h2" color="primary">{students[index]}</Typography></Box>}
                                <Button sx={{ alignSelf: "center" }} variant="contained" color="primary" disabled={students.length < 2} onClick={index === null ? handlePicker : () => { setIndex(null) }}>
                                    {index === null ? "Sortear" : "Voltar"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Container>
        </AppContext.Provider>
    )
}

export default AppProvider