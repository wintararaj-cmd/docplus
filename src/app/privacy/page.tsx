export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose max-w-none">
                <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                <p>Your privacy is important to us. This policy explains how we handle your data.</p>
                {/* Add more placeholder content as needed */}
                <h2 className="text-xl font-semibold mt-4 mb-2">1. Data Collection</h2>
                <p>We collect information necessary to provide our services.</p>
            </div>
        </div>
    )
}
