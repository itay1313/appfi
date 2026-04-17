import { Routes, Route } from "react-router-dom";
import { Providers } from "@/app/Providers";
import { Header } from "@/components/layout/Header";
import { BackgroundCanvas } from "@/components/layout/BackgroundCanvas";
import { ReviewsPage } from "@/components/reviews/ReviewsPage";

export default function App() {
  return (
    <Providers>
      <div className="relative min-h-dvh bg-background text-foreground">
        <BackgroundCanvas />
        <Header />
        <Routes>
          <Route path="*" element={<ReviewsPage />} />
        </Routes>
      </div>
    </Providers>
  );
}
