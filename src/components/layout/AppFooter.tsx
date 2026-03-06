import Container from "./Container";

const AppFooter = () => {
  return (
    <footer className="border-t border-primary/15 bg-white/80 backdrop-blur">
      <Container className="py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-[#6B7280]">
        <p className="font-semibold text-[#1F2329]">MyLark Workspace</p>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <span className="text-primary">Support</span>
          <span className="text-primary">Privacy</span>
          <span className="text-primary">Terms</span>
        </div>
      </Container>
    </footer>
  );
};

export default AppFooter;
