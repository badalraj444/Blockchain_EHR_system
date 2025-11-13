import React from "react";

/**
 * Long Intro / Landing article for EHR DApp
 * - Dark + green theme (Tailwind utility classes)
 * - Long article-style content (sections, pull-quotes, bullets)
 * - Image placeholders included with suggested search queries
 *
 * Note: This text pulls concepts and wording from the uploaded research paper
 * ("Secure decentralized electronic health records sharing system based on blockchains")
 * — citations to the uploaded file are listed below the component in the assistant message.
 */

export default function Intro() {
  return (
    <div className="min-h-screen flex items-center justify-start bg-[#050f0a] text-gray-100 p-8">
      <article className="prose prose-invert max-w-4xl mx-auto -mt-14  p-10 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-green-300 tracking-tight">
            Secure, Patient-First Electronic Health Records — Reimagined
          </h1>
          <p className="mt-4 text-gray-300 leading-relaxed max-w-3xl mx-auto">
            A new approach to medical records that blends cryptographic privacy,
            decentralized storage, and blockchain-based permissioning — so that
            you stay in control of who sees your data and why.
          </p>
          <p className="mt-3 italic text-green-200">
            Share safely • Track access • Grant and revoke permissions with full audit trails
          </p>
        </header>

        {/* Hero image placeholder */}
        <figure className="my-6">
          <div className="w-full h-100 bg-[url('https://www.netsuite.com/portal/assets/img/business-articles/erp/social-healthcare-data-security.jpg')] bg-center bg-cover rounded-lg border border-[#123822] flex items-center justify-center">
            {/* <span className="text-sm text-gray-400 bg-[rgba(0,0,0,0.45)] p-2 rounded">
              Hero image placeholder — replace with an image about healthcare + security.
            </span> */}
          </div>
          <figcaption className="text-xs text-gray-500 mt-2">
            Suggested image sources: Unsplash search "healthcare data security", "blockchain", or
            "medical records". Example searches:
            <br />
            <a className="text-green-200 underline" href="https://unsplash.com/s/photos/healthcare-data-security" target="_blank" rel="noreferrer">Unsplash: healthcare data security</a>
            {" • "}
            <a className="text-green-200 underline" href="https://unsplash.com/s/photos/blockchain" target="_blank" rel="noreferrer">Unsplash: blockchain</a>
          </figcaption>
        </figure>

        {/* Long article content */}
        <section className="mt-6">
          <h2 className="text-2xl text-green-200 font-semibold">Why the current system fails patients</h2>
          <p className="text-gray-300 leading-relaxed">
            Today your medical records often live scattered across dozens of systems —
            hospitals, clinics, labs, pharmacies, and even wearable devices. That fragmentation
            causes duplicate records, slow care coordination and, critically, large privacy and
            security risks. Studies show healthcare data is a highly prized target for attackers
            and breaches have had enormous financial and human costs. The current centralized
            way of storing and sharing health records is brittle: single points of failure are
            vulnerable to outages and DoS attacks, and manual consent processes are slow
            and error-prone. These problems led researchers to explore decentralization and
            cryptographic protections as an alternative.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl text-green-200 font-semibold">Our approach — privacy-first decentralization</h2>
          <p className="text-gray-300 leading-relaxed">
            The system we build (and the referenced research demonstrates) combines:
          </p>

          <ul className="text-gray-300 list-disc list-inside space-y-2">
            <li>
              <strong>Permissioned blockchain</strong> (IBFT/enterprise Ethereum) to record
              who has rights to what — immutable, auditable, and resistant to tampering.
            </li>
            <li>
              <strong>Decentralized file storage (IPFS)</strong> to keep the raw encrypted files off-chain,
              avoiding the blockchain bloat while preserving integrity and availability. Only a hash
              index (pointer) to the file is stored on-chain.
            </li>
            <li>
              <strong>Strong cryptography & threshold signatures</strong> so data owners remain private
              (care providers can upload on behalf of patients without exposing provider–patient mappings).
            </li>
          </ul>

          <p className="text-gray-300 mt-4 leading-relaxed">
            This hybrid design delivers the best of both worlds — fast, distributed file access via IPFS,
            and transparent, auditable permission management via a permissioned blockchain. The
            research shows this architecture improves resilience (no single point of failure) and
            provides strong privacy guarantees.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">How data flows — step by step</h3>

          <ol className="text-gray-300 list-decimal list-inside space-y-3 mt-3">
            <li>
              <strong>Data encryption & storage:</strong> a symmetric key encrypts the raw record,
              the encrypted blob is stored in the decentralized file system (IPFS) and a hash index
              (HI) is computed for retrieval.
            </li>
            <li>
              <strong>Key protection & metadata on-chain:</strong> the symmetric key is encrypted
              with the data owner's public key and the metadata (owner public key, data type, HI,
              encrypted key) is sent to the blockchain as a transaction so permission logic can operate.
            </li>
            <li>
              <strong>Threshold signing for privacy:</strong> when care providers upload data, miners
              perform threshold signatures so the uploader is not directly linkable to the patient,
              protecting against privacy linking attacks.
            </li>
            <li>
              <strong>Permission requests & grants:</strong> requesters (providers/researchers) submit
              permission transactions; the patient approves and a permission-grant transaction
              contains the requested HI, requester public key and the symmetric key encrypted
              to the requester. The requester then fetches the encrypted data from IPFS and decrypts it. 
            </li>
          </ol>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">Smart contracts & modular permissions</h3>
          <p className="text-gray-300 leading-relaxed">
            The design splits on-chain logic into small, focused smart contracts:
            a <em>Registry Contract</em> for anonymous user registration, a <em>Data Contract</em>
            for metadata and indexing, and a <em>Permission Contract</em> to record requests and
            approvals. This separation helps keep the blockchain fast and auditable while moving heavy
            data off-chain.
          </p>

          <figure className="my-4">
            <div className="w-full h-100 bg-[url('https://www.esa-automation.com/wp-content/uploads/2024/11/Smart-Contract-Esa-Automation.jpg')] bg-center bg-cover rounded-lg border border-[#123822] flex items-center justify-center">
              {/* <span className="text-sm text-gray-400 bg-[rgba(0,0,0,0.45)] p-2 rounded">
                Smart contract diagram placeholder — replace with an architecture diagram
              </span> */}
            </div>
            <figcaption className="text-xs text-gray-500 mt-2">
              Suggested illustration: "blockchain architecture diagram" on your favorite image site.
            </figcaption>
          </figure>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">Security & privacy highlights</h3>
          <p className="text-gray-300 leading-relaxed">
            A few security-focused design choices worth noting:
          </p>

          <ul className="text-gray-300 list-disc list-inside mt-3 space-y-2">
            <li><strong>Data never stored in plaintext on the chain</strong> — only hashes, encrypted keys and metadata are recorded. </li>
            <li><strong>Threshold signatures</strong> protect provider identity when adding data, limiting linkability and preserving patient privacy.</li>
            <li><strong>Permission expiry and fine-grained controls</strong> are possible by design (the Permission Contract can store expiry, access levels and revocation). The literature shows many systems lacked this, so this design explicitly supports it.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">Performance — is decentralization fast enough?</h3>
          <p className="text-gray-300 leading-relaxed">
            A common objection is that blockchains are slow. The referenced implementation uses a
            permissioned IBFT consensus (suitable for trusted healthcare networks) and caches heavy
            data off-chain in IPFS. Performance experiments reported in the research show the proposed
            approach achieves lower latency and higher throughput than classic PoW-based systems
            for most operations, and IPFS query times can outperform traditional centralized databases
            for read access in some scenarios. In short: with the right architecture — permissioned consensus +
            off-chain storage — decentralization can be practical for healthcare. 
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">Real-world benefits for each role</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-[rgba(255,255,255,0.01)] rounded border border-[#0b3b21]">
              <h4 className="text-green-200 font-semibold">Patients</h4>
              <p className="text-gray-300 text-sm">Full ownership, simple approval flows, emergency access paths, and transparent audit logs.</p>
            </div>

            <div className="p-4 bg-[rgba(255,255,255,0.01)] rounded border border-[#0b3b21]">
              <h4 className="text-green-200 font-semibold">Care Providers</h4>
              <p className="text-gray-300 text-sm">Add records on behalf of patients, request consent, and get verifiable history for clinical decisions.</p>
            </div>

            <div className="p-4 bg-[rgba(255,255,255,0.01)] rounded border border-[#0b3b21]">
              <h4 className="text-green-200 font-semibold">Researchers</h4>
              <p className="text-gray-300 text-sm">Request de-identified or limited-access datasets and receive auditable, time-limited access when granted.</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">How we protect emergencies</h3>
          <p className="text-gray-300 leading-relaxed">
            Emergency scenarios are essential to consider — when a patient cannot respond to a request
            for consent. The architectural model supports emergency access paths (with heavy auditing
            and limited scope) and fast local retrieval via IPFS so care teams can act quickly while the
            blockchain records and audits the reason for access. The original paper highlights the need
            to handle these cases carefully as they make the system practical for real-world clinical use. 
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-xl text-green-200 font-semibold">Call to action — what this means for you</h3>
          <p className="text-gray-300 leading-relaxed">
            If you are a patient: imagine having a single control panel for your entire health history —
            sharing with a new doctor is as simple as approving a permission request. If you are a provider:
            imagine verifiable provenance for every record you use in care. If you are a researcher:
            imagine requesting a curated dataset and receiving auditable access with clear privacy constraints.
          </p>

          <div className="mt-6 text-center">
            <a href="/auth/signup" className="inline-block px-6 py-2 rounded-md bg-gradient-to-r from-[#0ea45f] to-[#0b8f4e] font-semibold">
              Try a quick demo (dummy)
            </a>
          </div>
        </section>

        <footer className="mt-10 text-sm text-gray-500">
          <p>
            This page summarises design choices and results from the paper
            <strong className="text-gray-300"> “Secure decentralized electronic health records sharing system based on blockchains”</strong>.
            It highlights the benefits of permissioned blockchains + IPFS and threshold signing to build a practical,
            privacy-preserving EHR sharing platform.
          </p>
          <p className="mt-2">
            Paper references and technical details are available in the uploaded PDF (implementation, experiments and results).
            If you want, I can extract diagrams, tables or generate a condensed one-page technical brief from the paper.
          </p>
        </footer>
      </article>
    </div>
  );
}
