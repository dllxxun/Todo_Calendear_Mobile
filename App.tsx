// App.tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Calendar } from "react-native-calendars";
import "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type Todo = {
  id: string;
  title?: string;
  dueDate?: string; // "YYYY-MM-DD"
  isCompleted?: boolean;
};

function App() {
  const [user, setUser] = useState<null | { uid: string }>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(false);

  // 달력용 상태: 선택된 날짜 + 새 할일 제목
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [newTitle, setNewTitle] = useState("");

  // 로그인 상태 감시
  useEffect(() => {
    
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleAnonLogin = async () => {
    try {
      await auth().signInAnonymously();
    } catch (e) {
      console.log("login error", e);
    }
  };

  const handleLogout = async () => {
    await auth().signOut();
    setTodos([]);
  };

  const fetchTodos = async () => {
    if (!user) return;
    setLoadingTodos(true);
    try {
      const snapshot = await firestore()
        .collection("todos")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const list: Todo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setTodos(list);
    } catch (e) {
      console.log("fetch todos error", e);
    } finally {
      setLoadingTodos(false);
    }
  };

  // 선택된 날짜에 할 일 추가
  const addTodoForSelectedDate = async () => {
    if (!user || !newTitle.trim()) return;

    try {
      await firestore().collection("todos").add({
        title: newTitle.trim(),
        dueDate: selectedDate,
        isCompleted: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setNewTitle("");
      fetchTodos(); // 다시 불러오기
    } catch (e) {
      console.log("add todo error", e);
    }
  };

  // 할 일 삭제
  const deleteTodo = async (id: string) => {
    try {
      await firestore().collection("todos").doc(id).delete();
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.log("delete todo error", e);
    }
  };

  const toggleComplete = async (id: string, current: boolean | undefined) => {
    try {
      await firestore().collection("todos").doc(id).update({
        isCompleted: !current,
      });
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isCompleted: !current } : t
        )
      );
    } catch (e) {
      console.log("toggle complete error", e);
    }
  };

  const todosForSelectedDate = todos.filter(
    (t) => t.dueDate === selectedDate
  );

  if (!user) {
    // 로그인 전 화면
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 20, marginBottom: 16 }}>
          Todo & Calendar Mobile
        </Text>
        <Button title="익명 로그인" onPress={handleAnonLogin} />
        <Text style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
          (과제용: Firebase Auth 사용 확인용으로 익명 로그인 사용)
        </Text>
      </SafeAreaView>
    );
  }

  // 로그인 후 화면
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {/* 상단 UID + 로그아웃 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          UID: {user.uid.slice(0, 6)}...
        </Text>
        <Button title="로그아웃" onPress={handleLogout} />
      </View>

      <Button
        title="웹과 같은 FIRESTORE에서 TODOS 가져오기"
        onPress={fetchTodos}
      />

      {/* 1) 마감일 달력 */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          마감일 달력
        </Text>
        <Calendar
          onDayPress={(day) => {
            setSelectedDate(day.dateString); // "YYYY-MM-DD"
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#2563eb",
            },
          }}
        />
        <Text style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          선택한 날짜: {selectedDate}
        </Text>
      </View>

      {/* 2) 선택 날짜의 할 일 추가 */}
      <View
        style={{
          marginTop: 16,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {selectedDate} 의 할 일 추가
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="할 일을 입력하세요"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            />
          </View>
          <Button title="추가" onPress={addTodoForSelectedDate} />
        </View>
      </View>

      {/* 3) 선택 날짜의 할 일 리스트 */}
      {loadingTodos && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
        </View>
      )}

      <FlatList
        style={{ marginTop: 16 }}
        data={todosForSelectedDate}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#888" }}>
            선택한 날짜에 등록된 할 일이 없습니다.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.title || "(제목 없음)"}</Text>
            <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              마감일: {item.dueDate || "-"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: item.isCompleted ? "green" : "red",
                marginTop: 4,
              }}
            >
              {item.isCompleted ? "완료" : "미완료"}
            </Text>
            <Button
              title={item.isCompleted ? "미완료" : "완료"}
              onPress={() => toggleComplete(item.id, item.isCompleted)}
            />
            <Button title="삭제" onPress={() => deleteTodo(item.id)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default App;
