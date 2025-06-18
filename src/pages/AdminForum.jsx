import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Button, Stack, useToast, Spinner, Divider
} from "@chakra-ui/react";
import axios from "axios";

const AdminForum = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchTopics = async () => {
    try {
      const res = await axios.get("/api/topics");
      setTopics(res.data);
    } catch (err) {
      toast({
        title: "Ошибка при загрузке тем",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm("Удалить тему и все её сообщения?")) return;
    try {
      await axios.delete(`/api/topic/${id}`);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Тема удалена",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Ошибка при удалении темы",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  if (loading) return <Spinner size="xl" mt={10} />;

  return (
    <Box maxW="800px" mx="auto" mt={10} p={4}>
      <Heading size="lg" mb={6}>Модерация форума</Heading>
      <Stack spacing={6}>
        {topics.map((topic) => (
          <Box key={topic.id} borderWidth="1px" p={4} borderRadius="md" shadow="sm">
            <Heading size="md">{topic.title}</Heading>
            <Text fontSize="sm" color="gray.600" mb={2}>{topic.description}</Text>
            <Text fontSize="xs" color="gray.500">Автор ID: {topic.user_id}</Text>
            <Divider my={2} />
            <Stack direction="row" spacing={3}>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => deleteTopic(topic.id)}
              >
                Удалить тему
              </Button>
              <Button
                colorScheme="blue"
                size="sm"
                as="a"
                href={`/forum/topic/${topic.id}`}
              >
                Перейти в тему
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminForum;
