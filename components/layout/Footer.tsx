import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">BarberAI</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered barbershop booking and style consultation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/barbers" className="hover:text-foreground">Find a Barber</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="/signup?role=barber" className="hover:text-foreground">For Barbers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground">Sign up</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BarberAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
