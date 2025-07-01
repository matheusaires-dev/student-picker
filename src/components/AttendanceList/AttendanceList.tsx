import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  Redo,
  Undo,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

type Status = "presente" | "ausente" | "justificado";

interface Attendance {
  id: string;
  status: Status;
}

enum StudentStatus {
  ELIMINADO = 0,
  ATIVO = 1,
}

interface IAttendance {
  id: number;
  name: string;
  attendances: Attendance[];
  status?: StudentStatus;
}

const AttendanceList = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendanceList, setAttendanceList] = useState<IAttendance[]>([]);

  const todayId = new Date()
    .toLocaleDateString("pt-BR")
    .split("/")
    .reverse()
    .join(""); // yyyyMMdd

  const previous = attendanceList[currentIndex - 1];
  const current = attendanceList[currentIndex];
  const next = attendanceList[currentIndex + 1];

  const getAttendances = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendanceList?status=${StudentStatus.ATIVO}`);
      setAttendanceList(response.data);
    } catch (error) {
      console.error("Erro ao buscar lista de presença:", error);
    }
  };

  useEffect(() => {
    getAttendances();
  }, []);

  const handleStart = () => setCurrentIndex(0);

  const handleEnd = () => {
    const firstIncomplete = attendanceList.findIndex(
      (item) => !item.attendances?.length
    );
    setCurrentIndex(
      firstIncomplete !== -1 ? firstIncomplete : attendanceList.length - 1
    );
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((n) => n - 1);
  };

  const handleNext = () => {
    if (currentIndex < attendanceList.length - 1) setCurrentIndex((n) => n + 1);
  };

  const handleAttendance = async (status: Status) => {
    if (!current) return;

    const updatedAttendances = [...(current.attendances || [])];
    const index = updatedAttendances.findIndex((a) => a.id === todayId);

    if (index >= 0) {
      updatedAttendances[index].status = status;
    } else {
      updatedAttendances.push({ id: todayId, status });
    }

    try {
      await axios.patch(`http://localhost:3000/attendanceList/${current.id}`, {
        attendances: updatedAttendances,
      });
      await getAttendances();
      setCurrentIndex((n) => Math.min(n + 1, attendanceList.length - 1));
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
    }
  };

  // Função para excluir aluno (mudar status para ELIMINADO)
  const handleDelete = async () => {
    if (!current) return;
    try {
      await axios.patch(`http://localhost:3000/attendanceList/${current.id}`, {
        status: StudentStatus.ELIMINADO,
      });
      await getAttendances();
      setCurrentIndex((n) => Math.max(0, n - 1));
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
    }
  };

  const getColor = (attendances?: Attendance[]) => {
    const status = attendances?.find((a) => a.id === todayId)?.status;
    if (status === "presente") return "success.main";
    if (status === "ausente") return "error";
    if (status === "justificado") return "warning.main";
    return "primary";
  };

  return (
    <Container sx={{ height: "100vh" }}>
      <Stack height="100%" py={2}>
        <Box flexGrow={1}>
          <Typography
            variant="h2"
            color={getColor(previous?.attendances)}
            sx={{ opacity: 0.3 }}
          >
            {previous?.name || ""}
          </Typography>

          <Box py={16}>
            <Typography
              variant="h1"
              color={getColor(current?.attendances)}
              align="center"
            >
              {current?.name || "Carregando..."}
            </Typography>
          </Box>

          <Typography
            variant="h2"
            color={getColor(next?.attendances)}
            sx={{ opacity: 0.3 }}
          >
            {next?.name || ""}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <IconButton color="primary" onClick={handleStart}>
            <KeyboardDoubleArrowLeft />
          </IconButton>

          <IconButton color="primary" onClick={handleBack}>
            <Undo />
          </IconButton>

          <Button
            variant="contained"
            color="info"
            onClick={() => handleAttendance("justificado")}
          >
            Justificado
          </Button>

          <Button
            variant="contained"
            color="warning"
            onClick={() => handleAttendance("ausente")}
          >
            Faltou
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => handleAttendance("presente")}
          >
            Presente
          </Button>

          <IconButton color="primary" onClick={handleNext}>
            <Redo />
          </IconButton>

          <IconButton color="primary" onClick={handleEnd}>
            <KeyboardDoubleArrowRight />
          </IconButton>

          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            disabled={!current}
          >
            Excluir
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default AttendanceList;
