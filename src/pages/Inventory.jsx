import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  List,
  ListItem,
  Button,
  Select,
  useToast,
  Spinner,
  useColorModeValue,
  Text,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/JS_apiConfig";

const API_INVENTORY = `${API_BASE_URL}api/inventory`;
const API_BOOKS = `${API_BASE_URL}api/books`;
const API_SHELVES = `${API_BASE_URL}api/safeshelves`;
const API_AUTHORS = `${API_BASE_URL}api/authors`;

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState({});
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading, error } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему для просмотра инвентаря",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // Получаем токен
        const [inventoryResponse, shelvesResponse, authorsResponse] = await Promise.all([
          axios.get(`${API_INVENTORY}/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(API_SHELVES, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(API_AUTHORS, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBooks(inventoryResponse.data.map((entry) => entry.book));
        setShelves(shelvesResponse.data);
        setAuthors(authorsResponse.data || []);
      } catch (inventoryError) {
        try {
          const token = localStorage.getItem("token");
          const [booksResponse, shelvesResponse, authorsResponse] = await Promise.all([
            axios.get(API_BOOKS, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(API_SHELVES, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(API_AUTHORS, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setBooks(
            booksResponse.data.filter(
              (book) => book.user_id === user.id && book.status === "in_hand"
            )
          );
          setShelves(shelvesResponse.data);
          setAuthors(authorsResponse.data || []);
        } catch (booksError) {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить ваш инвентарь",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setBooks([]);
          setAuthors([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, toast, navigate]);

  const handleShelfChange = (bookId, shelfId) => {
    setSelectedShelf((prev) => ({
      ...prev,
      [bookId]: shelfId,
    }));
  };

  const releaseBook = async (bookId) => {
    const shelfId = selectedShelf[bookId];
    if (!shelfId) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите безопасную ячейку для книги",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BOOKS}/${bookId}/release`,
        {
          user_id: user.id,
          status: "available",
          safe_shelf_id: parseInt(shelfId),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
      toast({
        title: "Книга отпущена",
        description: `Книга "${response.data.book.title}" помещена в "${shelves.find((s) => s.id === parseInt(shelfId))?.name}".`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.response?.data?.error || "Не удалось отпустить книгу",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading || authLoading) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
      <Text color={textColor}>{error}</Text>
    </Container>
    );
  }

  return (
    <Container maxW="600px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Книги находящиеся у вас
      </Heading>

      <VStack
        spacing={4}
        align="stretch"
        bg={bgColor}
        p={6}
        borderRadius={8}
        borderWidth={1}
        borderColor={borderColor}
        boxShadow="md"
      >
        {books.length === 0 ? (
          <Text color={textColor}>У вас нет книг в инвентаре.</Text>
        ) : (
          <List spacing={3}>
            {books.map((book) => (
              <ListItem
                key={book.id}
                p={3}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius={4}
                borderWidth={1}
                borderColor={borderColor}
              >
                <Text color={textColor}>{book.title} (ISBN: {book.isbn})</Text>
                <Text color={textColor}>Статус: {book.status || "Не указан"}</Text>
                <Text color={textColor}>
                  Автор: {book.author_id ? authors.find((a) => a.id === book.author_id)?.name || "Неизвестен" : "Неизвестен"}
                </Text>

                <Box mt={2}>
                  <Select
                    placeholder="Выберите ячейку"
                    value={selectedShelf[book.id] || ""}
                    onChange={(e) => handleShelfChange(book.id, e.target.value)}
                    bg={useColorModeValue("gray.100", "gray.600")}
                    color={textColor}
                    borderColor={borderColor}
                  >
                    {shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.name} ({shelf.address})
                      </option>
                    ))}
                  </Select>
                </Box>

                <Button
                  colorScheme="teal"
                  onClick={() => releaseBook(book.id)}
                  size="sm"
                  mt={2}
                  isDisabled={!selectedShelf[book.id]}
                >
                  Отпустить книгу
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </VStack>
    </Container>
  );
};

export default Inventory;