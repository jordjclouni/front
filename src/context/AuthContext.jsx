import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/JS_apiConfig";
import { Spinner, Center } from "@chakra-ui/react"; // Для индикатора загрузки

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Содержит данные пользователя и токен
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  // Загружаем данные авторизации при старте
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && parsedUser.token) { // Проверяем валидность данных
            setUser(parsedUser); // Устанавливаем user с токеном
            // Устанавливаем токен для axios (лучше передавать в запросах)
            axios.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
          } else {
            setUser(null);
            delete axios.defaults.headers.common["Authorization"];
          }
        } else {
          setUser(null);
          delete axios.defaults.headers.common["Authorization"];
        }
      } catch (parseError) {
        console.error("Ошибка парсинга данных авторизации:", parseError);
        setUser(null);
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        setError("Ошибка загрузки данных авторизации.");
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Функция входа: запрос к бэкенду для получения токена
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        { email, password },
        { withCredentials: true } // Добавляем для поддержки сессий
      );
      const { token, ...userData } = response.data; // Предполагается, что бэкенд возвращает { token, ...userData }
      const newUser = { ...userData, token };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Устанавливаем токен глобально
      return true;
    } catch (error) {
      setError(error.response?.data?.message || "Ошибка входа.");
      throw error; // Пробрасываем ошибку для обработки в компоненте
    } finally {
      setLoading(false);
    }
  };

  // Функция выхода: удаляем данные
  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
  };

  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="lg" color="teal.500" />
      </Center>
    ); // Показываем индикатор загрузки
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
};