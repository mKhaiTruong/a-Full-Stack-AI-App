import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "~/components/ui/Button";
import Upload from "~/components/Upload";
import { useNavigate } from "react-router";

export function meta(_: Route.MetaArgs) {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }];
}

export default function Home() {
  const navigate = useNavigate();
  const handleUploadComplete = async (base64Image: string) => {
    const newId = Date.now().toString(); // Generate a unique ID based on the current timestamp

    navigate(`/visualizer/${newId}`);
    return true;
  };

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Roomify 2.0</p>
        </div>

        <h1 className="title">The Ultimate Video Conferencing Solution</h1>
        <p className="subtitle">
          Experience seamless communication with Roomify 2.0, the next generation of video conferencing software designed to connect you with colleagues,
          friends, and family like never before.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>

          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload Your Floor Plan</h3>
              <p>Support JPG and PNG formats up to 10MB</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Explore Our Projects</h2>
              <p>Your latest work and shared community projects, all in one place.</p>
            </div>
          </div>

          <div className="projects-grid">
            <div className="project-card group">
              <div className="preview">
                <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project Preview" />
                <div className="badge">Community</div>
              </div>

              <div className="card-body">
                <div>
                  <h3>Project One</h3>

                  <div className="meta">
                    <Clock size={12} />
                    <span>{new Date("01.01.2026").toLocaleDateString()}</span>
                    <span>By John Doe</span>
                  </div>
                </div>

                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
