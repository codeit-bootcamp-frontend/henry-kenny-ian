import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import Modal from "../Components/Modal/Modal";
import TodoListItem from "../Components/TodoList/TodoListItem";
import ProgressBar from "../Components/ProgressBar/ProgressBar";
import Button from "../Components/Button/Button";
import "../App.css";
import { firestore } from "../service/firebase";
import {
  collection,
  query,
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

const HomePage = ({ userInfo, isLoggedIn }) => {
  const [showModal, setShowModal] = useState(false);
  const [todoItems, setTodoItems] = useState([]);
  const queryPath = `/users/${userInfo?.uid}/todos`;
  const _query = collection(firestore, queryPath);
  const [todos, loading, error] = useCollectionData(_query);
  const progressPercentage = useMemo(() => {
    if (todoItems)
      return todoItems.filter((el) => el.isComplete).length / todoItems.length;
    return 0;
  }, [todoItems, todos]);

  const handleClickOpenModal = () => {
    setShowModal(true);
  };

  const handleClickCloseModal = () => {
    setShowModal(false);
  };

  const handleClickCheckBox = async (id) => {
    const q = query(collection(firestore, queryPath), where("id", "==", id));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      await updateDoc(doc.ref, {
        isComplete: !data.isComplete,
      });
    });
  };

  useEffect(() => {
    setTodoItems(todos);
  }, [todos]);

  if (!isLoggedIn) return <Navigate to="/signin" />;
  return (
    <>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "60px",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            fontWeight: "500",
            color: "#767676",
          }}
        >{`${userInfo.displayName}님의 할일 목록`}</div>
        <ProgressBar progress={progressPercentage} />

        <ul className="todolist-container">
          {todoItems &&
            todoItems.map((item) => (
              <li key={item.id}>
                <TodoListItem {...item} onClickCheckBox={handleClickCheckBox} />
              </li>
            ))}
        </ul>
        <div>
          <Button buttonType="create" onClick={handleClickOpenModal} />
        </div>
      </main>
      {showModal && (
        <Modal onClose={handleClickCloseModal} userInfo={userInfo} />
      )}
    </>
  );
};

export default HomePage;
