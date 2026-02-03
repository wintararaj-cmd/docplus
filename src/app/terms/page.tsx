export default function TermsPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose max-w-none">
                <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                <p>Welcome to DocPlus. By accessing our website, you agree to these terms.</p>
                {/* Add more placeholder content as needed */}
                <h2 className="text-xl font-semibold mt-4 mb-2">1. Use of Service</h2>
                <p>You agree to use our service for lawful purposes only.</p>
            </div>
        </div>
    )
}
