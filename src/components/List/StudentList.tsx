import { Stack } from "@mui/material"
import Student from "./Student/Student"
import useApp from "../../hooks/useApp";

const StudentList = () => {
    const { students, setStudents } = useApp();

    const handleDelete = (index: number) => {
        setStudents(prevStudents => {
            const updatedStudents = [...prevStudents];
            updatedStudents.splice(index, 1);
            return updatedStudents;
        });
    };
    return (
        <Stack spacing={1} >
            {students.map((student, index) => <Student key={index} name={student} onDelete={() => { handleDelete(index) }} />)}
        </Stack>
    )
}

export default StudentList