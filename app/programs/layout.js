import Navbar from "@/components/Navbar";


export default function ExaminerLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}
