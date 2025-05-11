import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  List,
  ListItem,
  Checkbox,
  Select,
  useToast,
  Spinner,
  useColorModeValue,
  Box,
  Text,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BOOKS = "http://127.0.0.1:5000/api/books";
const API_AUTHORS = "http://127.0.0.1:5000/api/authors";
const API_SHELVES = "http://127.0.0.1:5000/api/safeshelves";
const API_GENRES = "http://127.0.0.1:5000/api/genres";
const API_INVENTORY = "http://127.0.0.1:5000/api/inventory";

const AddBook = () => {
  const [form, setForm] = useState({
    title: "",
    author_id: "",
    author_search: "", // Для поиска авторов
    new_author_name: "", // Для создания нового автора
    new_author_description: "", // Описание нового автора
    description: "",
    safe_shelf_id: null,
    genre_ids: [],
    status: "in_hand",
  });

  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]); // Для автодополнения
  const [shelves, setShelves] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingAuthor, setIsAddingAuthor] = useState(false); // Для состояния добавления автора
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      try {
        await Promise.all([fetchAuthors(), fetchShelves(), fetchGenres()]);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [authLoading]);

  const fetchAuthors = async (searchTerm = "") => {
    try {
      const response = await axios.get(API_AUTHORS, {
        params: { search: searchTerm },
      });
      setAuthors(response.data);
      setFilteredAuthors(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить авторов",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await axios.get(API_SHELVES);
      setShelves(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить безопасные ячейки",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(API_GENRES);
      setGenres(response.data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить жанры",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value || (name === "safe_shelf_id" ? null : value) });

    // Если изменяется поле поиска автора, фильтруем авторов
    if (name === "author_search") {
      fetchAuthors(value); // Вызываем поиск авторов
    }
  };

  const handleAuthorSelect = (author) => {
    setForm({
      ...form,
      author_id: author.id,
      author_search: author.name,
      new_author_name: "", // Очищаем поле нового автора
      new_author_description: "",
    });
    setFilteredAuthors([]); // Скрываем список автодополнения
  };

  const handleAddAuthor = async () => {
    if (!form.new_author_name.trim()) {
      toast({
        title: "Ошибка",
        description: "Имя нового автора обязательно",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAddingAuthor(true);
    try {
      const response = await axios.post(API_AUTHORS, {
        name: form.new_author_name,
        description: form.new_author_description || "",
      });

      const newAuthor = response.data;
      setAuthors([...authors, { id: newAuthor.id, name: newAuthor.name, description: newAuthor.description }]);
      setForm({
        ...form,
        author_id: newAuthor.id,
        author_search: newAuthor.name,
        new_author_name: "",
        new_author_description: "",
      });
      setFilteredAuthors([]); // Скрываем список автодополнения

      toast({
        title: "Автор добавлен!",
        description: `Автор ${newAuthor.name} успешно добавлен`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось добавить автора";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAddingAuthor(false);
    }
  };

  const handleGenreChange = (id) => {
    setForm((prevForm) => ({
      ...prevForm,
      genre_ids: prevForm.genre_ids.includes(id)
        ? prevForm.genre_ids.filter((g) => g !== id)
        : [...prevForm.genre_ids, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.author_id || !form.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Название, автор и описание обязательны!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!user || !user.id) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы добавить книгу",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        author_id: form.author_id,
        description: form.description,
        safe_shelf_id: null,
        user_id: user.id,
        genre_ids: form.genre_ids,
        status: form.status,
      };

      const bookResponse = await axios.post(API_BOOKS, payload);
      const bookId = bookResponse.data.book_id;
      const isbn = bookResponse.data.isbn;

      await axios.post(API_INVENTORY, {
        user_id: user.id,
        book_id: bookId,
      });

      toast({
        title: "Книга добавлена!",
        description: `Книга добавлена в ваш инвентарь. ISBN: ${isbn}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setForm({
        title: "",
        author_id: "",
        author_search: "",
        new_author_name: "",
        new_author_description: "",
        description: "",
        safe_shelf_id: null,
        genre_ids: [],
        status: "in_hand",
      });
      navigate("/profile");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.error || "Не удалось добавить книгу";
      if (status === 401) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, войдите в систему",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } else if (status === 400) {
        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else if (status === 403) {
        toast({
          title: "Ошибка",
          description: "Недостаточно прав",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Ошибка",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData || authLoading) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  return (
    <Container maxW="600px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Добавить книгу
      </Heading>

      <VStack
        spacing={3}
        align="stretch"
        bg={bgColor}
        p={6}
        borderRadius={8}
        borderWidth={1}
        borderColor={borderColor}
        boxShadow="md"
      >
        <Input
          placeholder="Название книги"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        {/* Поле поиска авторов */}
        <Box position="relative">
          <Input
            placeholder="Поиск автора..."
            name="author_search"
            value={form.author_search}
            onChange={handleInputChange}
            bg={useColorModeValue("gray.100", "gray.600")}
            color={textColor}
            borderColor={borderColor}
            _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          />
          {filteredAuthors.length > 0 && form.author_search && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="md"
              zIndex={10}
              maxH="200px"
              overflowY="auto"
            >
              <List spacing={1}>
                {filteredAuthors.map((author) => (
                  <ListItem
                    key={author.id}
                    p={2}
                    _hover={{ bg: useColorModeValue("gray.200", "gray.600"), cursor: "pointer" }}
                    onClick={() => handleAuthorSelect(author)}
                  >
                    <Text color={textColor}>{author.name}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Поля для добавления нового автора */}
        <Input
          placeholder="Имя нового автора (если не нашли)"
          name="new_author_name"
          value={form.new_author_name}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Textarea
          placeholder="Описание нового автора (опционально)"
          name="new_author_description"
          value={form.new_author_description}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
        <Button
          colorScheme="teal"
          onClick={handleAddAuthor}
          isLoading={isAddingAuthor}
          loadingText="Добавление автора..."
          size="sm"
          width="full"
          mt={2}
          _hover={{ bg: "teal.600" }}
        >
          Добавить нового автора
        </Button>

        <Textarea
          placeholder="Описание книги"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Select
          name="status"
          value={form.status}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
          isDisabled={true}
        >
          <option value="in_hand">У меня</option>
        </Select>

        <Heading size="sm" mt={2} color={textColor}>
          Выберите жанры:
        </Heading>
        <List spacing={2}>
          {genres.map((genre) => (
            <ListItem key={genre.id}>
              <Checkbox
                isChecked={form.genre_ids.includes(genre.id)}
                onChange={() => handleGenreChange(genre.id)}
                colorScheme="teal"
                color={textColor}
                borderColor={borderColor}
                _focus={{ boxShadow: "0 0 0 1px teal.500" }}
              >
                {genre.name}
              </Checkbox>
            </ListItem>
          ))}
        </List>

        <Button
          colorScheme="teal"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Добавление..."
          color="white"
          size="lg"
          width="full"
          mt={4}
          _hover={{ bg: "teal.600" }}
        >
          Добавить книгу
        </Button>
      </VStack>
    </Container>
  );
};

export default AddBook;