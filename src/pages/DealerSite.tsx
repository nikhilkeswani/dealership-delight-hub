import { useParams } from "react-router-dom";

const DealerSite = () => {
  console.log('=== DealerSite: Component render start ===');
  
  try {
    const { slug } = useParams();
    console.log('DealerSite: Starting render with slug:', slug);
    
    // Simple test render first
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-4xl font-bold">DealerSite Component Loaded</h1>
        <p>Slug: {slug}</p>
        <p>This is a test to see if the basic component renders without error.</p>
        <p>If you see this message, the component is loading successfully!</p>
      </div>
    );
  } catch (error) {
    console.error('DealerSite: Error during render:', error);
    throw error;
  }
};

export default DealerSite;