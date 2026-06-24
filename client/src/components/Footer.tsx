export default function Footer() {
  return (
    <footer className="border-t-3 border-black bg-park-yellow mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white border-3 border-black rounded-lg flex items-center justify-center font-extrabold">
                P
              </div>
              <span className="text-lg font-extrabold">ParkChain</span>
            </div>
            <p className="text-sm font-medium">
              Decentralized parking management powered by Stellar blockchain.
            </p>
          </div>
          <div>
            <h3 className="font-extrabold mb-3">Product</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>Features</li>
              <li>Pricing</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold mb-3">Company</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>About</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm font-medium">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="border-t-3 border-black mt-8 pt-6 text-center text-sm font-bold">
          © 2026 ParkChain. Built on Stellar Testnet.
        </div>
      </div>
    </footer>
  );
}
