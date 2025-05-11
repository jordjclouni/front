import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  Container,
  Image,
  VStack,
  useColorModeValue,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import RegisterBookModal from "../components/RegisterBookModal";
import { API_URL } from "../config/JS_apiConfig";

const API_USER_PROFILE = `${API_URL}/api/user/profile`;

const UserProfile = () => {
  const { user, logout, loading: authLoading, error } = useAuth();
  const [isRegisterBookOpen, setIsRegisterBookOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const openRegisterBookModal = () => setIsRegisterBookOpen(true);
  const closeRegisterBookModal = () => setIsRegisterBookOpen(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(API_USER_PROFILE);
        setProfile(response.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: error.response?.data?.message || "Не удалось загрузить профиль",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Profile fetch error:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchProfile();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="600px" py={6}>
        <Text color={textColor}>{error}</Text>
      </Container>
    );
  }

  if (!user || !profile) {
    return (
      <Container maxW="600px" py={6}>
        <Text color={textColor}>Вы не авторизованы. Пожалуйста, войдите в систему.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="600px" mt={8}>
      <Text fontSize="2xl" fontWeight="bold" color={textColor} textAlign="center" mb={4}>
        Личный кабинет
      </Text>

      <VStack
        spacing={4}
        align="stretch"
        p={6}
        borderWidth={1}
        borderRadius="md"
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="md"
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Аватар"
            boxSize="150px"
            objectFit="cover"
            borderRadius="full"
            mx="auto"
            mb={4}
          />
        ) : (
          <Box
            boxSize="150px"
            mx="auto"
            mb={4}
            bg={useColorModeValue("gray.200", "gray.600")}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color={textColor}>Нет аватара</Text>
          </Box>
        )}

        <Text fontSize="lg" color={textColor}>
          <strong>Имя:</strong> {profile.name}
        </Text>
        <Text fontSize="lg" color={textColor}>
          <strong>Email:</strong> {profile.email}
        </Text>
        {profile.bio && (
          <Text fontSize="lg" color={textColor}>
            <strong>О себе:</strong> {profile.bio}
          </Text>
        )}
        {profile.phone && (
          <Text fontSize="lg" color={textColor}>
            <strong>Телефон:</strong> {profile.phone}
          </Text>
        )}
        {profile.birth_date && (
          <Text fontSize="lg" color={textColor}>
            <strong>Дата рождения:</strong> {new Date(profile.birth_date).toLocaleDateString()}
          </Text>
        )}
      </VStack>

      <Box mt={4} display="flex" flexWrap="wrap" gap={3}>
        <Button
          colorScheme="teal"
          onClick={() => navigate("/edit-profile")}
          _hover={{ bg: "teal.600" }}
        >
          Редактировать профиль
        </Button>
        <Button
          colorScheme="teal"
          onClick={openRegisterBookModal}
          _hover={{ bg: "teal.600" }}
        >
          Зарегистрировать книгу
        </Button>
        <Button
          colorScheme="teal"
          onClick={() => navigate("/books")}
          _hover={{ bg: "teal.600" }}
        >
          Найти книги
        </Button>
        <Button
          colorScheme="red"
          onClick={logout}
          _hover={{ bg: "red.600" }}
        >
          Выйти
        </Button>
      </Box>

      <RegisterBookModal isOpen={isRegisterBookOpen} onClose={closeRegisterBookModal} />
    </Container>
  );
};

export default UserProfile;