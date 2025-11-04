# Publishing hypz-sdk (Python)

Prerequisites:
- PyPI account and API token
- `pip install build twine`

Steps:

```bash
# From hypz-sdk/python
python -m build
# Upload to TestPyPI first (optional)
python -m twine upload --repository testpypi dist/*
# Upload to PyPI
python -m twine upload dist/*
```

Notes:
- Version bump in setup.py required for each publish
- Ensure README renders on PyPI (long_description)
- Use `__version__` consistently
