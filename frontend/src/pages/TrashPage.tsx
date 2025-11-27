import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/types';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  RestoreFromTrash as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import ConfirmDialog from '../components/ConfirmDialog';
import { trashAPI } from '../api/api';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const TrashPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load trash todos from API
  useEffect(() => {
    const fetchTrashTodos = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch trash todos...');
        // Don't pass any parameters to avoid potential validation issues
        const response = await trashAPI.getTrash();
        console.log('Trash API response:', response);
        if (response.data.success) {
          console.log('Fetched todos:', response.data.data?.todos || []);
          setTodos(response.data.data?.todos || []);
        } else {
          throw new Error(response.data.error?.message || '휴지통 목록을 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        console.error('Error fetching trash todos:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
          setError(`API 오류: ${err.response.status} - ${err.response.data.error?.message || '요청을 처리할 수 없습니다.'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('Request data:', err.request);
          setError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
          setError(err.message || '휴지통 목록을 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTodos();
  }, []);

  // Handle restoring a todo
  const handleRestore = async (id: string) => {
    // Validate UUID format before sending request
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setError('유효하지 않은 ID 형식입니다.');
      console.error('Invalid UUID format:', id);
      return false;
    }

    try {
      setIsProcessing(true);
      console.log('Attempting to restore todo with id:', id);
      const response = await trashAPI.restoreTodo(id);
      console.log('Restore API response:', response);
      if (response.data.success) {
        // Remove the restored todo from the list
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        return true;
      } else {
        throw new Error(response.data.error?.message || '할일 복원에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error restoring todo:', err);
      if (err.response) {
        setError(`API 오류: ${err.response.status} - ${err.response.data.error?.message || '요청을 처리할 수 없습니다.'}`);
      } else {
        setError(err.message || '할일 복원에 실패했습니다.');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle permanent deletion
  const handlePermanentDelete = async () => {
    if (!todoToDelete) return;

    // Validate UUID format before sending request
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(todoToDelete)) {
      setError('유효하지 않은 ID 형식입니다.');
      console.error('Invalid UUID format:', todoToDelete);
      return false;
    }

    try {
      setIsProcessing(true);
      console.log('Attempting to permanently delete todo with id:', todoToDelete);
      const response = await trashAPI.deletePermanently(todoToDelete);
      console.log('Permanent delete API response:', response);
      if (response.data.success) {
        // Remove the permanently deleted todo from the list
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoToDelete));
        setTodoToDelete(null);
        setShowConfirmDialog(false);
        return true;
      } else {
        throw new Error(response.data.error?.message || '할일 영구 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Error permanently deleting todo:', err);
      if (err.response) {
        setError(`API 오류: ${err.response.status} - ${err.response.data.error?.message || '요청을 처리할 수 없습니다.'}`);
      } else {
        setError(err.message || '할일 영구 삭제에 실패했습니다.');
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            휴지통
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : todos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              휴지통이 비어 있습니다.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {todos.map(todo => (
              <Box key={todo.id} sx={{ width: '100%' }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {todo.title}
                        </Typography>

                        {todo.content && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {todo.content}
                          </Typography>
                        )}

                        <Typography variant="caption" color="text.secondary">
                          삭제일시: {todo.deletedAt ? format(new Date(todo.deletedAt), 'yyyy-MM-dd HH:mm', { locale: ko }) : 'N/A'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="복원">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleRestore(todo.id)}
                              color="primary"
                              disabled={isProcessing}
                            >
                              <RestoreIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="영구 삭제">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setTodoToDelete(todo.id);
                                setShowConfirmDialog(true);
                              }}
                              color="error"
                              disabled={isProcessing}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setTodoToDelete(null);
        }}
        onConfirm={handlePermanentDelete}
        title="할일 영구 삭제"
        message="정말로 이 할일을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="영구 삭제"
        cancelText="취소"
      />
    </Container>
  );
};

export default TrashPage;