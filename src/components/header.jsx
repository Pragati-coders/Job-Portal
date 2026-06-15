import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "./ui/button";
import {
  BriefcaseBusiness,
  Heart,
  PenBox,
  BarChart2,
  Building2,
  Sparkles,
} from "lucide-react";

const Header = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [search, setSearch] = useSearchParams();
  const { user } = useUser();

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);
    }
  }, [search]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowSignIn(false);
      setSearch({});
    }
  };

  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  return (
    <>
      <nav className="py-4 flex justify-between items-center">
        {/* ── Inline SVG Logo (no image file needed) ── */}
        <Link to="/" className="flex items-center">
          <svg
            width="160"
            height="38"
            viewBox="0 0 160 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="HireFlow logo"
            role="img"
          >
            {/* Briefcase */}
            <rect
              x="2" y="13" width="22" height="17" rx="2"
              stroke="white" strokeWidth="1.8"
            />
            <path
              d="M9 13V10.5C9 9.4 9.9 8.5 11 8.5H15C16.1 8.5 17 9.4 17 10.5V13"
              stroke="white" strokeWidth="1.8" strokeLinecap="round"
            />
            <line
              x1="2" y1="21" x2="24" y2="21"
              stroke="white" strokeWidth="1.3"
            />
            {/* Flow arrow */}
            <path
              d="M28 19.5 L32 19.5"
              stroke="white" strokeWidth="1.4"
              strokeLinecap="round" strokeDasharray="2 2"
            />
            <path
              d="M30.5 16.5 L34.5 19.5 L30.5 22.5"
              stroke="white" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round"
              fill="none"
            />
            {/* Wordmark */}
            <text
              x="39" y="25"
              fontFamily="Georgia, serif"
              fontSize="18" fontWeight="700"
              fill="white" letterSpacing="0.5"
            >
              HireFlow
            </text>
          </svg>
        </Link>

        {/* ── Right side nav ── */}
        <div className="flex gap-5 items-center">
          <SignedIn>
            <Link
              to="/companies"
              className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block"
            >
              Companies
            </Link>
            <Link
              to="/jobs"
              className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block"
            >
              Jobs
            </Link>
          </SignedIn>

          <SignedOut>
            <Button
              variant="outline"
              onClick={() => setShowSignIn(true)}
            >
              Login
            </Button>
          </SignedOut>

          <SignedIn>
            {isRecruiter && (
              <>
                <Link to="/ai-job-writer">
                  <Button
                    variant="outline"
                    className="rounded-full border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hidden sm:flex items-center gap-2"
                  >
                    <Sparkles size={15} />
                    AI Write
                  </Button>
                </Link>
                <Link to="/post-job">
                  <Button
                    variant="destructive"
                    className="rounded-full"
                  >
                    <PenBox size={18} className="mr-2" />
                    Post a Job
                  </Button>
                </Link>
              </>
            )}

            <UserButton
              appearance={{ elements: { avatarBox: "w-10 h-10" } }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Jobs"
                  labelIcon={<BriefcaseBusiness size={15} />}
                  href="/my-jobs"
                />
                <UserButton.Link
                  label="Saved Jobs"
                  labelIcon={<Heart size={15} />}
                  href="/saved-jobs"
                />
                <UserButton.Link
                  label="Application Tracker"
                  labelIcon={<BarChart2 size={15} />}
                  href="/tracker"
                />
                <UserButton.Link
                  label="Companies"
                  labelIcon={<Building2 size={15} />}
                  href="/companies"
                />
                <UserButton.Action label="manageAccount" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </nav>

      {/* ── Sign In Modal ── */}
      {showSignIn && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={handleOverlayClick}
        >
          <SignIn
            signUpForceRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
          />
        </div>
      )}
    </>
  );
};

export default Header;
