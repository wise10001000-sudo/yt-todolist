import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/types';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TodoCard from '../components/TodoCard';
import TodoCreateModal from '../components/TodoCreateModal';
import { todoAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all'); // today, this-week, this-month, all
  const [sort, setSort] = useState<string>('endDateAsc'); // endDateAsc, createdAtDesc
  const { user } = useAuth();

  // Load todos from API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await todoAPI.getTodos();
        if (response.data.success) {
          setTodos(response.data.data?.todos || []);
        } else {
          throw new Error(response.data.error?.message || '할일 목록을 불러오는데 실패했습니다.');
        }
      } catch (err: any) {
        setError(err.message || '할일 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTodos();
    }
  }, [user]);

  // Handle creating new todo
  const handleCreateTodo = async (todoData: Omit<Todo, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await todoAPI.createTodo(todoData);
      if (response.data.success && response.data.data) {
        // Add the new todo to the list
        setTodos(prevTodos => [response.data.data!.todo, ...prevTodos]);
        return true;
      } else {
        throw new Error(response.data.error?.message || '할일 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '할일 생성에 실패했습니다.');
      return false;
    }
  };

  // Handle updating a todo
  const handleUpdateTodo = async (id: string, todoData: Partial<Todo>) => {
    try {
      const response = await todoAPI.updateTodo(id, todoData);
      if (response.data.success && response.data.data) {
        // Update the todo in the list
        setTodos(prevTodos => 
          prevTodos.map(todo => 
            todo.id === id ? response.data.data!.todo : todo
          )
        );
        return true;
      } else {
        throw new Error(response.data.error?.message || '할일 수정에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '할일 수정에 실패했습니다.');
      return false;
    }
  };

  // Handle deleting a todo (move to trash)
  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await todoAPI.deleteTodo(id);
      if (response.data.success) {
        // Remove the todo from the list
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        return true;
      } else {
        throw new Error(response.data.error?.message || '할일 삭제에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '할일 삭제에 실패했습니다.');
      return false;
    }
  };

  // Apply filters and sorting
  const filteredAndSortedTodos = todos
    .filter(todo => {
      // Apply filter based on date
      const now = new Date();
      const endDate = new Date(todo.endDate);
      
      switch(filter) {
        case 'today':
          return endDate.toDateString() === now.toDateString();
        case 'this-week':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return endDate >= oneWeekAgo && endDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case 'this-month':
          return endDate.getMonth() === now.getMonth() && endDate.getFullYear() === now.getFullYear();
        default:
          return true; // 'all'
      }
    })
    .sort((a, b) => {
      // Apply sorting
      if (sort === 'endDateAsc') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else { // createdAtDesc
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            할일 목록
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
          >
            할일 추가
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>필터</InputLabel>
            <Select
              value={filter}
              label="필터"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="today">오늘</MenuItem>
              <MenuItem value="this-week">이번 주</MenuItem>
              <MenuItem value="this-month">이번 달</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>정렬</InputLabel>
            <Select
              value={sort}
              label="정렬"
              onChange={(e) => setSort(e.target.value)}
            >
              <MenuItem value="endDateAsc">종료일순</MenuItem>
              <MenuItem value="createdAtDesc">생성일순</MenuItem>
            </Select>
          </FormControl>
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
        ) : filteredAndSortedTodos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              아직 할일이 없습니다.
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
              첫 할일을 추가해보세요!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredAndSortedTodos.map(todo => (
              <Box key={todo.id} sx={{ width: '100%' }}>
                <TodoCard
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <TodoCreateModal 
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreateTodo}
      />
    </Container>
  );
};

export default DashboardPage;