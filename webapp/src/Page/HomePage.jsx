import Header from "../Components/header"
import GreetingSection from "../Components/greeting-section"

import FeatureGrid from "../Components/feature-grid"
import TutorFeatureGrid from "../Components/TutorFeatureGrid" 
import useAuth from "../ContextAPI/UseAuth"

export default function HomePage() {
  const { user } = useAuth();  

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <GreetingSection />
        
        {user && (
          user.type === 'Tutor' ? <TutorFeatureGrid /> : <FeatureGrid />
        )}
      </main>
    </div>
  )
}
