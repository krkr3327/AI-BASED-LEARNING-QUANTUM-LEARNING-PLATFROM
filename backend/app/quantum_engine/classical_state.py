class ClassicalState:
    """
    Represents an independent classical register.
    """
    def __init__(self, num_cbits: int):
        self.num_cbits = num_cbits
        self.bits = [0] * num_cbits

    def set_bit(self, index: int, value: int):
        if index < 0 or index >= self.num_cbits:
            raise ValueError(f"Classical bit index {index} out of bounds.")
        self.bits[index] = value

    def get_bit(self, index: int) -> int:
        if index < 0 or index >= self.num_cbits:
            raise ValueError(f"Classical bit index {index} out of bounds.")
        return self.bits[index]

    def get_bitstring(self) -> str:
        return "".join(str(b) for b in self.bits)
