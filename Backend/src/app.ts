import express, { type ErrorRequestHandler } from "express";
import { z } from "zod";
import { countByCategory, getFeaturedProducts, rankProducts, searchProducts } from "./catalog.js";
import { sendEnquiryEmail } from "./emailSender.js";
import { fakeStore } from "./fakeStore.js";

interface AppDependencies {
  catalog?: typeof fakeStore;
  sendEmail?: typeof sendEnquiryEmail;
}

export function createApp(dependencies: AppDependencies = {}) {
  const catalog = dependencies.catalog ?? fakeStore;
  const sendEmail = dependencies.sendEmail ?? sendEnquiryEmail;
  const app = express();
  app.use(express.json({ limit: "20kb" }));

  const router = express.Router();

  router.get("/health", (_request, response) => response.json({ status: "ok" }));

  router.get("/products/featured", async (_request, response, next) => {
    try {
      response.json(getFeaturedProducts(await catalog.getProducts()));
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/search", async (request, response, next) => {
    const query = z.string().trim().min(1).safeParse(request.query.q);
    if (!query.success) {
      response.status(400).json({ error: "Enter a search term." });
      return;
    }

    try {
      response.json(searchProducts(await catalog.getProducts(), query.data));
    } catch (error) {
      next(error);
    }
  });

  router.get("/products", async (_request, response, next) => {
    try {
      response.json(rankProducts(await catalog.getProducts()));
    } catch (error) {
      next(error);
    }
  });

  router.get("/categories", async (_request, response, next) => {
    try {
      const [names, products] = await Promise.all([catalog.getCategories(), catalog.getProducts()]);
      response.json(countByCategory(names, products));
    } catch (error) {
      next(error);
    }
  });

  router.get("/categories/:category/products", async (request, response, next) => {
    try {
      response.json(rankProducts(await catalog.getCategoryProducts(request.params.category)));
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/:id", async (request, response, next) => {
    const id = z.coerce.number().int().positive().safeParse(request.params.id);
    if (!id.success) {
      response.status(400).json({ error: "Product ID must be a positive integer." });
      return;
    }

    try {
      response.json(await catalog.getProduct(id.data));
    } catch (error) {
      next(error);
    }
  });

  const EnquirySchema = z.object({
    productId: z.number().int().positive(),
    name: z.string().trim().min(2).max(80),
    email: z.email(),
    phone: z.string().trim().max(40).optional(),
    message: z.string().trim().min(10).max(1000),
  });

  router.post("/enquiries", async (request, response, next) => {
    const enquiry = EnquirySchema.safeParse(request.body);
    if (!enquiry.success) {
      response.status(400).json({ error: "Check the contact details and message, then try again." });
      return;
    }

    try {
      const product = await catalog.getProduct(enquiry.data.productId);
      await sendEmail(product, enquiry.data);
      response.status(202).json({ message: "Your enquiry has been sent." });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", router);
  app.use((_request, response) => response.status(404).json({ error: "Route not found." }));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = message === "Product not found." ? 404 : 502;
    if (status === 502) console.error("Request failed:", message);
    response.status(status).json({ error: status === 404 ? message : "The request could not be completed." });
  };

  app.use(errorHandler);
  return app;
}

export const app = createApp();