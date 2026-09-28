export default function AuthHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl 
      flex items-center justify-center mb-4">
        <span className="text-white text-3xl font-bold">B</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">BizFlow</h1>
      <p className="text-muted-foreground mt-2">Run your business from anywhere</p>
    </div>
  );
}