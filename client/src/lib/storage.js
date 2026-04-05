import { AwardIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL; // backend-ի URL
const token = localStorage.getItem("jwt_token")

export async function addQuiz(quiz) {
  try {

    console.log(`${API_URL}/admin/addQuiz`)
    const response = await fetch(`${API_URL}/admin/addQuiz`, {

      // http://localhost:8181/admin/addQuiz
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: quiz.title,
        level: quiz.level,
        topic: quiz.topic,
        question: quiz.question
      })
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData.message || "Add quiz failed");
    }
    return await response.text()

  } catch (e) {
    throw e;
  }

}

export async function updateQuiz(quiz, id) {
  try {
    const response = await fetch(`${API_URL}/admin/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quiz)

    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Add quiz failed");
    }
    return await response.json()
  }
  catch (error) {
    throw error;
  }
}

export async function getAllQuizzes() {
  try {
    const response = await fetch(`${API_URL}/admin/getAllQuizzes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.message());
      throw new Error(data.message || "Failed to fetch quizzes");
    }

    return data;
  } catch (e) {
    throw e;
  }

}

export async function deleteQuiz(id) {
  try {
    const response = await fetch(`${API_URL}/admin/delete/${id}`, {
      method: "DELETE",
    })
    const data = await response.text();
    if (!response.ok) {
      throw new Error(data || "Failed to delete quiz")
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getAllPlayers() {
  try {
    const response = await fetch(`${API_URL}/admin/getAllPlayers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data
  } catch (e) {
    throw e;
  }

}



