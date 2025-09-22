import { useParams } from "react-router-dom";
import { usePublicDealer } from "@/hooks/usePublicDealer";

const DealerSite = () => {
  console.log('=== DealerSite: Component render start ===');
  
  try {
    const { slug } = useParams();
    console.log('DealerSite: Starting render with slug:', slug);
    
    // Test adding hooks one by one
    const { data: publicDealer, isLoading: dealerLoading, error: dealerError } = usePublicDealer(slug);
    console.log('DealerSite: PublicDealer hook result:', { data: publicDealer, isLoading: dealerLoading, error: dealerError });
    
    // Simple test render first
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-4xl font-bold">DealerSite Component Loaded</h1>
        <p>Slug: {slug}</p>
        <p>Dealer Loading: {dealerLoading ? 'Yes' : 'No'}</p>
        <p>Dealer Data: {publicDealer ? JSON.stringify(publicDealer) : 'None'}</p>
        <p>Dealer Error: {dealerError ? JSON.stringify(dealerError) : 'None'}</p>
        <p>This is a test to see if the hooks work without error.</p>
      </div>
    );
  } catch (error) {
    console.error('DealerSite: Error during render:', error);
    throw error;
  }
};

export default DealerSite;