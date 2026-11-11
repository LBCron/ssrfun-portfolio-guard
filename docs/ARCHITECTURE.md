# SSR.FUN Portfolio Guard Architecture

## System Diagram

```mermaid
flowchart TD
    subgraph OnChain["Solana Mainnet (SSR.FUN Primitive)"]
        RPC[Solana RPC Node]
        Pyth[Pyth / Switchboard Oracles]
        Mints[Tokenized Assets: SOL, cbBTC, SPY, QQQ, GLD, TLT]
        Vault[SSR.FUN Reserve Vault]
    end

    subgraph GuardCore["@lbcron/ssrfun-portfolio-guard"]
        NavCalc[NavCalculator - Fixed-Point AUM & PnL Math]
        Optimizer[PortfolioOptimizer - MPT & Risk Parity Engine]
        Auditor[BetaAuditor - 5 Reproducible Bug Models]
        Thesis[InvestmentThesis - All-Weather Alpha Allocations]
        CLI[bin/cli.js - CLI & Turnkey Submitter]
    end

    subgraph ClientExecution["Autonomous & Human Interaction"]
        User[@LBCron / 32647Bri8KhJQE11x26iF7fpae9nouCJSZ8Y2VPpq5yM]
        XPost[X Announcement & PnL Card]
        Feedback[In-App Feedback Modal on ssr.fun]
        EarnSubmit[Superteam Earn Payout Submission]
    end

    RPC --> NavCalc
    Pyth --> NavCalc
    Mints --> Vault
    NavCalc --> Optimizer
    Optimizer --> CLI
    Auditor --> Feedback
    Thesis --> XPost
    CLI --> EarnSubmit
    User --> XPost
    User --> Feedback
    User --> EarnSubmit
```

## Security & Reliability Invariants

1. **Exact Conservation of Units**: No residual integer truncation on fractional shares during multi-asset mints.
2. **Fixed-Point NAV Scaling**: 6 decimal fixed-point precision eliminates floating-point decay across cumulative trades.
3. **Drift-Triggered Banding**: Dynamic ±5.0% threshold bounds portfolio turnover while preserving Sharpe ratio.
4. **Comprehensive Defensive Bug Suite**: Identifies and remediates 5 critical/high/medium vulnerabilities before mainnet scale.
