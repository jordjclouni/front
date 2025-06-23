import React, { useState, useEffect } from "react";
import {
  Container,
  Heading,
  VStack,
  Box,
  Text,
  Input,
  Textarea,
  Button,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/JS_apiConfig';

const API_USER_PROFILE = `${API_BASE_URL}api/user/profile`;

const EditProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    birth_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const localUser = JSON.parse(localStorage.getItem("user"));
  const userId = localUser?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(API_USER_PROFILE, {
          headers: {
            "X-User-ID": userId,
          },
          withCredentials: true,
        });

        setProfile(response.data);
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.put(
        API_USER_PROFILE,
        {
          ...profile,
          user_id: userId,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("user", JSON.stringify({ ...localUser, ...profile }));

      toast({
        title: "Профиль обновлён!",
        description: "Ваши данные успешно сохранены",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/profile");
    } catch (error) {
      const message = error.response?.data?.error || "Не удалось обновить профиль";
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

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <Container maxW="600px" py={6} textAlign="center">
        <Spinner size="lg" color="teal.500" />
      </Container>
    );
  }

  return (
    <Container maxW="600px" py={6}>
      <Heading mb={4} color={textColor} textAlign="center">
        Редактировать профиль
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
          placeholder="Имя"
          name="name"
          value={profile.name || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Text color={textColor}>Email: {profile.email}</Text>

        <Textarea
          placeholder="О себе"
          name="bio"
          value={profile.bio || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Input
          placeholder="Телефон"
          name="phone"
          value={profile.phone || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />

        <Input
          type="date"
          placeholder="Дата рождения"
          name="birth_date"
          value={profile.birth_date || ""}
          onChange={handleInputChange}
          bg={useColorModeValue("gray.100", "gray.600")}
          color={textColor}
          borderColor={borderColor}
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />


        <Box display="flex" gap={3}>
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Сохранение..."
            width="full"
            _hover={{ bg: "teal.600" }}
          >
            Сохранить
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={handleCancel}
            width="full"
            color={textColor}
            borderColor={borderColor}
            _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
          >
            Отмена
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditProfile;
