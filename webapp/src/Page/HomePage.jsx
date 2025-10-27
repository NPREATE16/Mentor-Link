import Header from "../Components/header"
import GreetingSection from "../Components/greeting-section"

// 1. Import cả hai Grid
import FeatureGrid from "../Components/feature-grid"
import TutorFeatureGrid from "../Components/TutorFeatureGrid" 
// 2. Import useAuth để biết user là ai
import useAuth from "../ContextAPI/UseAuth"

export default function HomePage() {
  // 3. Lấy thông tin user
  const { user } = useAuth();  

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <GreetingSection />
        
       
        {user && (
          user.type === 'Student' ? <FeatureGrid /> : <TutorFeatureGrid />
        )}
      </main>
    </div>
  )
}