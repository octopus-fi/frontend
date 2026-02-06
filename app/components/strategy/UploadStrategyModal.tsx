import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadJsonToWalrus } from "@/lib/walrus";
import { buildRegisterStrategyTransaction } from "@/sdk/transactions/register-strategy";
import { useSignAndExecuteTransaction, useCurrentAccount } from "@mysten/dapp-kit";
import { Upload, Loader2, CheckCircle, AlertCircle, FileJson } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface UploadStrategyModalProps {
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

export function UploadStrategyModal({ onSuccess, trigger }: UploadStrategyModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'idle' | 'uploading' | 'registering' | 'success'>('idle');
    const [blobId, setBlobId] = useState<string>("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        warningLtv: "6000",
        rebalanceLtv: "6500",
        maxLtv: "7000",
        liquidationLtv: "8000",
        actionRules: "Push LTV to 65% for max leverage. Rebalance only when approaching 70%."
    });

    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
    const account = useCurrentAccount();
    const { addNotification } = useUIStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) {
            addNotification({
                type: 'error',
                title: 'Wallet Required',
                message: 'Please connect your wallet to upload a strategy'
            });
            return;
        }

        try {
            setLoading(true);
            setStep('uploading');

            // Construct full StrategyTemplate object
            const strategyJson = {
                metadata: {
                    name: formData.name,
                    description: formData.description,
                    creator: account.address,
                    version: "1.0.0",
                    createdAt: Date.now(),
                    tags: ["community", "walrus"],
                },
                parameters: {
                    maxLtv: Number(formData.maxLtv) / 100, // Convert bps to %
                    targetHealth: 1.5, // Default safe value
                    rebalanceThreshold: Number(formData.rebalanceLtv) / 100,
                    autoCompound: true,
                    emergencyAction: 'repay_debt'
                },
                // Initial backtest data for UI visualization
                backtest: {
                    period: '30d',
                    totalReturn: 0,
                    maxDrawdown: 0,
                    sharpeRatio: 0,
                    winRate: 0,
                    historicalPerformance: [],
                    rebalanceTriggers: []
                },
                performance: {
                    avg30dReturn: 0,
                    totalUsers: 0,
                    riskScore: 5,
                    totalValueManaged: 0
                }
            };

            console.log('Uploading to Walrus...', strategyJson);

            // 1. Upload to Walrus
            // Pass mutateAsync directly to helper
            const blob = await uploadJsonToWalrus({
                json: strategyJson,
            });

            setBlobId(blob);
            setStep('registering');
            console.log('Blob ID received:', blob);

            // 2. Register On-Chain
            const tx = buildRegisterStrategyTransaction({
                name: formData.name,
                blobId: blob,
            });

            await signAndExecute({
                transaction: tx,
            });

            setStep('success');
            addNotification({
                type: 'success',
                title: 'Strategy Registered',
                message: `Successfully registered "${formData.name}" on-chain!`
            });

            setTimeout(() => {
                setOpen(false);
                onSuccess?.();
                // Reset form
                setStep('idle');
                setBlobId("");
                setFormData({ ...formData, name: "", description: "" });
            }, 2000);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setStep('idle');
            addNotification({
                type: 'error',
                title: 'Upload Failed',
                message: err.message || 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        if (step === 'uploading') {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <div className="text-center">
                        <h3 className="font-semibold">Uploading to Walrus</h3>
                        <p className="text-sm text-muted-foreground">Storing strategy data on decentralized storage...</p>
                    </div>
                </div>
            );
        }

        if (step === 'registering') {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                    <div className="text-center">
                        <h3 className="font-semibold">Registering On-Chain</h3>
                        <p className="text-sm text-muted-foreground">Linking Blob ID to Registry...</p>
                        <p className="text-xs font-mono mt-2 bg-muted p-1 rounded max-w-[200px] truncate mx-auto text-muted-foreground">
                            Blob: {blobId}
                        </p>
                    </div>
                </div>
            );
        }

        if (step === 'success') {
            return (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <div className="text-center">
                        <h3 className="font-semibold">Upload Complete!</h3>
                        <p className="text-sm text-muted-foreground">Your strategy is now live.</p>
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Strategy Name</label>
                    <Input
                        required
                        placeholder="e.g. Aggressive Alpha"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                        required
                        placeholder="Describe your strategy..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Warning LTV (bps)</label>
                        <Input
                            type="number"
                            required
                            value={formData.warningLtv}
                            onChange={e => setFormData({ ...formData, warningLtv: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rebalance LTV (bps)</label>
                        <Input
                            type="number"
                            required
                            value={formData.rebalanceLtv}
                            onChange={e => setFormData({ ...formData, rebalanceLtv: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Borrow LTV (bps)</label>
                        <Input
                            type="number"
                            required
                            value={formData.maxLtv}
                            onChange={e => setFormData({ ...formData, maxLtv: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Liquidation LTV (bps)</label>
                        <Input
                            type="number"
                            required
                            value={formData.liquidationLtv}
                            onChange={e => setFormData({ ...formData, liquidationLtv: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Action Rules</label>
                    <Input
                        required
                        placeholder="Logic description..."
                        value={formData.actionRules}
                        onChange={e => setFormData({ ...formData, actionRules: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="electric" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload & Register
                    </Button>
                </div>
            </form>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="electric" size="lg" className="gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Strategy
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Strategy</DialogTitle>
                    <DialogDescription>
                        Publish your strategy to the decentralized registry using Walrus storage.
                    </DialogDescription>
                </DialogHeader>
                {renderStepContent()}
            </DialogContent>
        </Dialog>
    );
}
