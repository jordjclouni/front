import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Button,
  Textarea,
  Select,
  useToast,
  Spinner,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BOOKS = "http://127.0.0.1:5000/api/books";
const API_REVIEWS = "http://127.0.0.1:5000/api/reviews";

const BookPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ text: "", rating: "" });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const bookResponse = await axios.get(`${API_BOOKS}/${id}`);
        const reviewsResponse = await axios.get(`${API_REVIEWS}/${id}`);
        setBook(bookResponse.data);
        setReviews(reviewsResponse.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные о книге",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) fetchBookData();
  }, [id, authLoading]);

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleAddReview = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, войдите в систему, чтобы оставить отзыв",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    if (!newReview.text.trim() || !newReview.rating) {
      toast({
        title: "Ошибка",
        description: "Текст отзыва и рейтинг обязательны",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(API_REVIEWS, {
        book_id: id,
        text: newReview.text,
        rating: parseInt(newReview.rating),
      });
      setReviews([
        {
          book_id: id,
          user_id: user.id,
          name: user.name,
          text: newReview.text,
          rating: parseInt(newReview.rating),
        },
        ...reviews,
      ]);
      setNewReview({ text: "", rating: "" });
      onClose();
      toast({
        title: "Отзыв добавлен!",
        description: "Ваш отзыв успешно добавлен",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось добавить отзыв";
      toast({
        title: "Ошибка",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Container maxW="800px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  if (!book) {
    return (
      <Container maxW="800px" py={6} textAlign="center">
        <Text color={textColor}>Книга не найдена</Text>
      </Container>
    );
  }

  return (
    <Container maxW="800px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        {book.title}
      </Heading>

      <Box
        p={4}
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          О книге
        </Text>
        <Text color={textColor}>Автор: {book.author?.name || "Неизвестный автор"}</Text>
        <Text color={textColor}>Жанры: {book.genres?.join(", ") || "Не указаны"}</Text>
        <Text color={textColor}>ISBN: {book.isbn}</Text>
        <Text color={textColor}>Описание: {book.description}</Text>
        <Text color={textColor}>
          Статус: {book.status === "available" ? "Доступна" : "У пользователя"}
        </Text>
        {book.shelf_location && (
          <Text color={textColor}>
            Местоположение: {book.shelf_location.name}, {book.shelf_location.address}
          </Text>
        )}
      </Box>

      <Heading size="md" mb={4} color={textColor}>
        Отзывы
      </Heading>

      <Button
        colorScheme="teal"
        onClick={onOpen}
        mb={4}
        width="full"
        _hover={{ bg: "teal.600" }}
      >
        Оставить отзыв
      </Button>

      <VStack spacing={4} align="stretch">
        {reviews.length === 0 ? (
          <Text color={textColor} textAlign="center">
            Отзывов пока нет. Будьте первым!
          </Text>
        ) : (
          reviews.map((review, index) => (
            <Box
              key={index}
              p={4}
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="sm"
            >
              <Text fontWeight="bold" color={textColor}>
                {review.name}
              </Text>
              <Text color={textColor}>Рейтинг: {review.rating}/5</Text>
              <Text color={textColor}>{review.text}</Text>
            </Box>
          ))
        )}
      </VStack>

      {/* Модальное окно для добавления отзыва */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader color={textColor}>Оставить отзыв</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3}>
              <Textarea
                placeholder="Ваш отзыв"
                name="text"
                value={newReview.text}
                onChange={handleReviewInputChange}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
              />
              <Select
                placeholder="Выберите рейтинг"
                name="rating"
                value={newReview.rating}
                onChange={handleReviewInputChange}
                bg={useColorModeValue("gray.100", "gray.600")}
                color={textColor}
                borderColor={borderColor}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              onClick={handleAddReview}
              isLoading={isSubmitting}
              loadingText="Отправка..."
              mr={3}
              _hover={{ bg: "teal.600" }}
            >
              Отправить
            </Button>
            <Button variant="ghost" onClick={onClose} color={textColor}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BookPage;