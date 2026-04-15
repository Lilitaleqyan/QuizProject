import { createServer } from "http";

export async function registerRoutes(app) {

  app.get("/api/books", async (req, res) => {
    try {
   
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Произошло ошибка" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}