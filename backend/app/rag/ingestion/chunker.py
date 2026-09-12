import re
from typing import List, Dict, Any

class MarkdownSemanticChunker:
    """
    Chunks markdown documents based on headers and paragraphs while preserving metadata.
    """
    def __init__(self, max_chunk_size: int = 1500, min_chunk_size: int = 50):
        self.max_chunk_size = max_chunk_size
        self.min_chunk_size = min_chunk_size

    def chunk_document(self, text: str, document_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        chunks = []
        
        # Split by headers (e.g., #, ##, ###)
        sections = re.split(r'(?m)^#{1,6}\s+.*$', text)
        headers = re.findall(r'(?m)^#{1,6}\s+(.*)$', text)
        
        if not headers:
            headers = ["General"]
            
        # Ensure we have a matching number of sections and headers
        if len(sections) > len(headers):
            sections = sections[1:] # Drop the first empty section before the first header

        for idx, (header, section_text) in enumerate(zip(headers, sections)):
            # Clean section
            clean_text = section_text.strip()
            if len(clean_text) < self.min_chunk_size:
                continue
                
            # If a section is too large, split by paragraphs
            if len(clean_text) > self.max_chunk_size:
                paragraphs = clean_text.split('\n\n')
                current_chunk = ""
                sub_idx = 0
                for p in paragraphs:
                    if len(current_chunk) + len(p) > self.max_chunk_size and current_chunk:
                        chunk_meta = document_metadata.copy()
                        chunk_meta['chunk_id'] = f"{document_metadata.get('document_id', 'doc')}_sec{idx}_part{sub_idx}"
                        chunk_meta['topic'] = header
                        chunks.append({
                            "text": current_chunk.strip(),
                            "metadata": chunk_meta
                        })
                        current_chunk = p + "\n\n"
                        sub_idx += 1
                    else:
                        current_chunk += p + "\n\n"
                
                if current_chunk.strip():
                    chunk_meta = document_metadata.copy()
                    chunk_meta['chunk_id'] = f"{document_metadata.get('document_id', 'doc')}_sec{idx}_part{sub_idx}"
                    chunk_meta['topic'] = header
                    chunks.append({
                        "text": current_chunk.strip(),
                        "metadata": chunk_meta
                    })
            else:
                chunk_meta = document_metadata.copy()
                chunk_meta['chunk_id'] = f"{document_metadata.get('document_id', 'doc')}_sec{idx}"
                chunk_meta['topic'] = header
                chunks.append({
                    "text": clean_text,
                    "metadata": chunk_meta
                })
                
        return chunks
