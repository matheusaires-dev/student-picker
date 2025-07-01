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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
  const [resetOpen, setResetOpen] = useState(false);

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
      const response = await axios.get(`http://localhost:3000/attendanceList`);
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

  // Função para avançar para o próximo aluno ativo
  const goToNextActive = () => {
    let nextIdx = currentIndex + 1;
    while (
      nextIdx < attendanceList.length &&
      attendanceList[nextIdx].status === StudentStatus.ELIMINADO
    ) {
      nextIdx++;
    }
    setCurrentIndex(Math.min(nextIdx, attendanceList.length - 1));
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
      goToNextActive();
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

  // Função para reativar aluno (mudar status para ATIVO)
  const handleReactivate = async () => {
    if (!current) return;
    try {
      await axios.patch(`http://localhost:3000/attendanceList/${current.id}`, {
        status: StudentStatus.ATIVO,
      });
      await getAttendances();
    } catch (error) {
      console.error("Erro ao reativar aluno:", error);
    }
  };

  // Função para resetar a presença de hoje
  const handleResetList = async () => {
    try {
      await Promise.all(
        attendanceList.map((aluno) => {
          const filteredAttendances = (aluno.attendances || []).filter(a => a.id !== todayId);
          return axios.patch(`http://localhost:3000/attendanceList/${aluno.id}`, {
            attendances: filteredAttendances,
          });
        })
      );
      await getAttendances();
      setCurrentIndex(0);
      setResetOpen(false);
    } catch (error) {
      console.error("Erro ao resetar lista:", error);
    }
  };

  const getColor = (attendances?: Attendance[]) => {
    const status = attendances?.find((a) => a.id === todayId)?.status;
    if (status === "presente") return "success.main";
    if (status === "ausente") return "error";
    if (status === "justificado") return "warning.main";
    return "primary";
  };

  const eliminatedColor = 'text.disabled';

  return (
    <Container sx={{ height: "100vh" }}>
      <Stack height="100%" py={2}>
        <Box flexGrow={1}>
          <Typography
            variant="h2"
            color={previous?.status === StudentStatus.ELIMINADO ? eliminatedColor : getColor(previous?.attendances)}
            sx={{ opacity: 0.3, textDecoration: previous?.status === StudentStatus.ELIMINADO ? 'line-through' : 'none' }}
          >
            {previous?.name || ""}
          </Typography>

          <Box py={16}>
            <Typography
              variant="h1"
              color={current?.status === StudentStatus.ELIMINADO ? eliminatedColor : getColor(current?.attendances)}
              align="center"
              sx={{ textDecoration: current?.status === StudentStatus.ELIMINADO ? 'line-through' : 'none' }}
            >
              {current?.name || "Carregando..."}
            </Typography>
            {current && (
              <Typography variant="h5" align="center" color="text.secondary">
                Faltas: {current.attendances?.filter(a => a.status === "ausente").length || 0}
              </Typography>
            )}
          </Box>

          <Typography
            variant="h2"
            color={next?.status === StudentStatus.ELIMINADO ? eliminatedColor : getColor(next?.attendances)}
            sx={{ opacity: 0.3, textDecoration: next?.status === StudentStatus.ELIMINADO ? 'line-through' : 'none' }}
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
            disabled={current?.status === StudentStatus.ELIMINADO}
          >
            Justificado
          </Button>

          <Button
            variant="contained"
            color="warning"
            onClick={() => handleAttendance("ausente")}
            disabled={current?.status === StudentStatus.ELIMINADO}
          >
            Faltou
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={() => handleAttendance("presente")}
            disabled={current?.status === StudentStatus.ELIMINADO}
          >
            Presente
          </Button>

          <IconButton color="primary" onClick={handleNext}>
            <Redo />
          </IconButton>

          <IconButton color="primary" onClick={handleEnd}>
            <KeyboardDoubleArrowRight />
          </IconButton>

          
          {current?.status === StudentStatus.ELIMINADO ? (
            <Button
              variant="outlined"
              sx={{ borderColor: 'rgba(0,0,0,0.23)' }}
              onClick={handleReactivate}
              color='success'
            >
              Reativar
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{ borderColor: 'rgba(0,0,0,0.23)' }}
              onClick={handleDelete}
              color="error"
            >
              Excluir
            </Button>
          )}
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setResetOpen(true)}
          >
            Resetar Lista
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
      >
        <DialogTitle>Resetar Lista de Presença</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja resetar todas as presenças? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleResetList} color="error" variant="contained">
            Resetar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceList;
