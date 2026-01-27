import { Link } from 'react-router-dom';
import { BookOpen, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                CBLE<span className="text-primary">Test</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Master the Customs Broker License Exam with adaptive learning, spaced repetition,
              and comprehensive practice. Built on learning science principles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Study Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/study?mode=quick_drill" className="hover:text-foreground transition-colors">
                  HTSUS Practice Questions
                </Link>
              </li>
              <li>
                <Link to="/flashcards" className="hover:text-foreground transition-colors">
                  19 CFR Flashcards
                </Link>
              </li>
              <li>
                <Link to="/study?mode=exam_simulation" className="hover:text-foreground transition-colors">
                  CBLE Exam Blueprint
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-foreground transition-colors">
                  Exam Readiness Score
                </Link>
              </li>
            </ul>
          </div>

          {/* Domains */}
          <div>
            <h4 className="mb-4 font-semibold">CBLE Domains</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-default">Customs Valuation</li>
              <li className="hover:text-foreground cursor-default">Broker Compliance</li>
              <li className="hover:text-foreground cursor-default">Trade Agreements</li>
              <li className="hover:text-foreground cursor-default">Liquidation & Protests</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CBLETest. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-destructive" /> for customs broker candidates
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> This is an educational study tool only. It is not affiliated with
            U.S. Customs and Border Protection (CBP) or the Treasury Department. Always refer to official
            CBP publications and the current Code of Federal Regulations for authoritative information.
          </p>
        </div>
      </div>
    </footer>
  );
}
