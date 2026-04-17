import { Routes, Route } from "react-router-dom";
import { Providers } from "@/app/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackgroundCanvas } from "@/components/layout/BackgroundCanvas";
import { ReviewsPage } from "@/components/reviews/ReviewsPage";

export default function App() {
  return (
    <Providers>
      <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <BackgroundCanvas />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="*" element={<ReviewsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Providers>
  );
}
