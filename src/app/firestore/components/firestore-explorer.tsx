"use client"

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderTree, File, Folder, ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { listRootCollections } from "../actions/firestore-actions";

type TreeNode = {
    id: string;
    name: string;
    type: 'collection' | 'document';
    path: string;
    children?: TreeNode[];
};

export default function FirestoreExplorer() {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [selectedDocument, setSelectedDocument] = useState<{ path: string; data: any } | null>(null);
    const [editedData, setEditedData] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingDoc, setIsFetchingDoc] = useState(false);
    const [isFetchingChildren, setIsFetchingChildren] = useState<Record<string, boolean>>({});

    const { toast } = useToast();

    useEffect(() => {
        const fetchCollections = async () => {
            setLoading(true);
            try {
                const collectionNames = await listRootCollections();
                const collections = collectionNames.map(name => ({
                    id: name,
                    name,
                    type: 'collection' as 'collection',
                    path: name,
                }));
                setTreeData(collections);
            } catch (error) {
                console.error("Error fetching collections:", error);
                const errorMessage = error instanceof Error ? error.message : "Could not fetch collections.";
                toast({ variant: "destructive", title: "Error", description: errorMessage });
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, [toast]);

    const toggleNode = async (node: TreeNode) => {
        const isExpanded = !!expandedNodes[node.path];
        setExpandedNodes(prev => ({ ...prev, [node.path]: !isExpanded }));

        if (!isExpanded && node.type === 'collection' && !node.children) {
            setIsFetchingChildren(prev => ({...prev, [node.path]: true}));
            try {
                const db = getFirestore(app);
                const collectionRef = collection(db, node.path);
                const docSnapshot = await getDocs(collectionRef);
                const children = docSnapshot.docs.map(d => ({
                    id: d.id,
                    name: d.id,
                    type: 'document' as 'document',
                    path: d.ref.path,
                }));
                
                setTreeData(prevTree => updateTree(prevTree, node.path, children));

            } catch (error) {
                console.error("Error fetching documents:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch documents." });
            } finally {
                setIsFetchingChildren(prev => ({...prev, [node.path]: false}));
            }
        }
    };
    
    const updateTree = (nodes: TreeNode[], path: string, children: TreeNode[]): TreeNode[] => {
        return nodes.map(node => {
            if (node.path === path) {
                return { ...node, children };
            }
            if (node.children) {
                return { ...node, children: updateTree(node.children, path, children) };
            }
            return node;
        });
    };

    const handleSelectDocument = async (node: TreeNode) => {
        if (node.type === 'document') {
            setIsFetchingDoc(true);
            setSelectedDocument(null);
            try {
                const db = getFirestore(app);
                const docRef = doc(db, node.path);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedDocument({ path: node.path, data });
                    setEditedData(JSON.stringify(data, null, 2));
                }
            } catch (error) {
                 console.error("Error fetching document:", error);
                 toast({ variant: "destructive", title: "Error", description: "Could not fetch document data." });
            } finally {
                setIsFetchingDoc(false);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedDocument) return;
        setIsSaving(true);
        try {
            const db = getFirestore(app);
            const docRef = doc(db, selectedDocument.path);
            const newData = JSON.parse(editedData);
            await updateDoc(docRef, newData);
            setSelectedDocument(prev => prev ? { ...prev, data: newData } : null);
            toast({ title: "Success", description: "Document updated successfully." });
        } catch (error) {
            console.error("Error saving document:", error);
            const errorMessage = error instanceof Error ? error.message : "Invalid JSON format or failed to update.";
            toast({ variant: "destructive", title: "Save Error", description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    }


    const renderTree = (nodes: TreeNode[], level = 0) => (
        <ul style={{ paddingLeft: `${level * 20}px` }}>
            {nodes.map(node => (
                <li key={node.path}>
                    <div 
                        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted cursor-pointer" 
                        onClick={() => node.type === 'collection' ? toggleNode(node) : handleSelectDocument(node)}
                    >
                       <span className="w-6 flex items-center justify-center">
                         {node.type === 'collection' ? (
                            isFetchingChildren[node.path] ? (
                                <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                               <ChevronRight className={`h-4 w-4 transition-transform ${expandedNodes[node.path] ? 'rotate-90' : ''}`}/>
                            )
                         ) : null}
                       </span>
                        {node.type === 'collection' ? <Folder className="h-4 w-4 text-accent" /> : <File className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">{node.name}</span>
                    </div>
                    {expandedNodes[node.path] && node.children && renderTree(node.children, level + 1)}
                </li>
            ))}
        </ul>
    );

    if (loading && treeData.length === 0) {
        return (
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Database...</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FolderTree className="h-5 w-5"/> Collections</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderTree(treeData)}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Document Editor</CardTitle>
                    <CardDescription>
                        {selectedDocument ? `Editing: ${selectedDocument.path}`: "Select a document to view or edit its data."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isFetchingDoc ? (
                         <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                            <Loader2 className="mr-4 h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Fetching document...</p>
                        </div>
                    ) : selectedDocument ? (
                        <div className="space-y-4">
                            <Textarea 
                                value={editedData}
                                onChange={(e) => setEditedData(e.target.value)}
                                className="font-mono min-h-[300px] text-xs"
                                spellCheck="false"
                            />
                             <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Changes"}
                             </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center rounded-lg border border-dashed p-12 h-full">
                           <File className="h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-muted-foreground">No document selected</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
