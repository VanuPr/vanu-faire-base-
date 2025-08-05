import FirestoreExplorer from '@/app/firestore/components/firestore-explorer';

export default function FirestorePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Firestore Database</h1>
        <p className="text-muted-foreground">
          Browse, edit, and manage your collections and documents.
        </p>
      </div>
      <FirestoreExplorer />
    </div>
  );
}
