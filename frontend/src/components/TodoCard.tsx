import React, { useState } from 'react';
import type { Todo } from '../types/types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import TodoEditModal from './TodoEditModal';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onUpdate, onDelete }) => {
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      console.log('Attempting to delete todo with id:', todo.id);
      const success = await onDelete(todo.id);
      if (!success) {
        setError('할일 삭제에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('할일 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate days until expiration
  const endDate = new Date(todo.endDate);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine status color
  let statusColor: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' = 'default';
  if (diffDays < 0) {
    statusColor = 'error'; // Expired
  } else if (diffDays <= 2) {
    statusColor = 'warning'; // Imminent
  } else {
    statusColor = 'success'; // Normal
  }

  return (
    <>
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 3,
          },
          borderLeft: `4px solid ${statusColor === 'error' ? '#FF5B5B' : statusColor === 'warning' ? '#FF9500' : '#00C73C'}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {todo.title}
                </Typography>
                <Chip 
                  label={diffDays < 0 ? '만료됨' : diffDays <= 2 ? '임박' : '정상'} 
                  size="small" 
                  color={statusColor}
                  variant="outlined"
                />
              </Box>
              
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
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {todo.startDate 
                    ? `${format(new Date(todo.startDate), 'yyyy-MM-dd HH:mm', { locale: ko })} ~ ${format(new Date(todo.endDate), 'yyyy-MM-dd HH:mm', { locale: ko })}`
                    : `~ ${format(new Date(todo.endDate), 'yyyy-MM-dd HH:mm', { locale: ko })}`}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="수정">
                <IconButton 
                  size="small" 
                  onClick={() => setOpenEditModal(true)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <span>
                  <IconButton 
                    size="small" 
                    onClick={handleDelete}
                    color="error"
                    disabled={isDeleting}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
          
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      <TodoEditModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        todo={todo}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default TodoCard;