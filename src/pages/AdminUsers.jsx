import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_USERS = "http://127.0.0.1:5000/api/users";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_USERS, { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список пользователей",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        await axios.delete(`${API_USERS}/${userId}`, { withCredentials: true });
        setUsers(users.filter((user) => user.id !== userId));
        toast({
          title: "Успех",
          description: "Пользователь удалён",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить пользователя",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (loading) {
    return (
      <Container maxW="800px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  return (
    <Container maxW="800px" py={6}>
      <Heading mb={4}>Управление пользователями</Heading>
      <VStack spacing={4} align="stretch">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Имя</Th>
              <Th>Роль</Th>
              <Th>Действия</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.name}</Td>
                <Td>{user.role_name || "Пользователь"}</Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    mr={2}
                    onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Удалить
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Container>
  );
};

export default AdminUsers;