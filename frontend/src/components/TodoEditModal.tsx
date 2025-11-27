import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import FormDateTimePicker from './FormDateTimePicker';

interface TodoEditModalProps {
  open: boolean;
  onClose: () => void;
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => Promise<boolean>;
}

const TodoEditModal: React.FC<TodoEditModalProps> = ({ open, onClose, todo, onUpdate }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form when modal opens or todo changes
  useEffect(() => {
    if (open && todo) {
      setTitle(todo.title);
      setContent(todo.content || '');
      setStartDate(todo.startDate ? parseISO(todo.startDate) : null);
      setEndDate(todo.endDate ? parseISO(todo.endDate) : null);
      setError(null);
    }
  }, [open, todo]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('제목은 필수 입력 항목입니다.');
      return;
    }
    
    if (!endDate) {
      setError('종료일은 필수 입력 항목입니다.');
      return;
    }
    
    if (startDate && endDate && startDate > endDate) {
      setError('시작일은 종료일보다 늦을 수 없습니다.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await onUpdate(todo.id, {
        title: title.trim(),
        content: content.trim() || undefined,
        startDate: startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { locale: ko }) : undefined,
        endDate: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", { locale: ko }),
      });

      if (success) {
        onClose();
      } else {
        setError('할일 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('할일 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          minHeight: '500px',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        할일 수정
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="할일 제목"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{ maxLength: 200 }}
            helperText={`${title.length}/200`}
          />
          
          <TextField
            margin="dense"
            label="내용"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            inputProps={{ maxLength: 2000 }}
            helperText={`${content.length}/2000`}
          />

          <FormDateTimePicker
            name="startDate"
            label="시작일"
            value={startDate}
            onChange={setStartDate}
          />

          <FormDateTimePicker
            name="endDate"
            label="종료일 *"
            value={endDate}
            onChange={setEndDate}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoEditModal;